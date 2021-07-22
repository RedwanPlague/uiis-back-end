const express = require("express");
const router = express.Router();
const { CourseSession } = require("../../admin/courseSessions/model");
const CurrentSession = require("../../admin/currentSessions/model");
const { getCorSes, getCorSes2 } = require("../examiner/helpers");
const constants = require("../../utils/constants");
const { changeResultState, publishResult } = require("../teacher-common/resultStatusUtil");
const Department = require("../../admin/departments/model");
const { get_marked_student_list } = require("../issues/service");

router.put("/publish", async (req, res) => {
    try {
        await publishResult();     
        res.send({ message: "hemlo" });
    } catch (error) {
        console.log(error);
        res.status(404).send(error);
    }
});

router.get("/result-published", async (req, res) => {
    try {
        const ecoForwarded = (await CurrentSession.findOne()
            .select("resultPublished")).resultPublished;     
        res.send({ resultPublished: ecoForwarded });
    } catch (error) {
        console.log(error);
        res.status(404).send(error);
    }
});

router.get("/:session", async (req, res) => {

    try {
        const user = req.user;
        const session = new Date(`${req.params.session} UTC`);

        const courseSessions = await CourseSession.find({
            session: session,
        })
            .select("course status")
            .populate({
                path: "course",
                select: "courseID title",
            });

        const ecoForwarded = (await CurrentSession.findOne()
            .select("resultPublished")).resultPublished;

        const toRet = courseSessions.map((cs) => ({
            courseID: cs.course.courseID,
            courseTitle: cs.course.title,
            hasForwarded: ecoForwarded,
            prevDone: (ecoForwarded || cs.status === constants.RESULT_STATUS.ECO),
        }));

        res.send({ toRet });
    } catch (error) {
        console.log(error);
        res.status(404).send(error);
    }
});

router.get("/:courseID/:session", async (req, res) => {
    try {
        const courseID = req.params.courseID;
        const session = new Date(`${req.params.session} UTC`);
        const user = req.user;

        const courseSession = await getCorSes(courseID, session);

        const ecoForwarded = (await CurrentSession.findOne()
            .select("resultPublished")).resultPublished;

        let allApproved = true;

        if (allApproved) {

            const teacherColored = [];
            for (const teacher of courseSession.teachers) {
                const colored = await get_marked_student_list(user.id, courseID, session, "-", teacher.teacher);
                teacherColored.push({
                    teacher: teacher.teacher,
                    unchangedList: colored.unchanged_list,
                    updatedList: colored.updated_list,
                });
            }

            const examinerColored = [];
            for (const examiner of courseSession.examiners) {
                const colored = await get_marked_student_list(user.id, courseID, session, examiner.part, examiner.teacher);
                examinerColored.push({
                    teacher: examiner.teacher,
                    part: examiner.part,
                    unchangedList: colored.unchanged_list,
                    updatedList: colored.updated_list,
                });
            }

            res.send({
                hasForwarded: ecoForwarded,
                names: courseSession.names,
                teachers: courseSession.teachers,
                examiners: courseSession.examiners,
                students: courseSession.registrationList,
                credit: courseSession.course.credit,
                perEvalWeight: courseSession.perEvalWeight,
                totalEvalCount: courseSession.totalEvalCount,
                consideredEvalCount: courseSession.consideredEvalCount,
                attendanceWeight: courseSession.attendanceWeight,
                termFinalParts: courseSession.termFinalParts,
                totalMarks: courseSession.totalMarks,
                teacherColored,
                examinerColored,
            });
        } else {
            res.status(401).send({ message: "Not everyone submitted" });
        }
    } catch (error) {
        console.log(error);
        res.status(401).send(error);
    }
});

module.exports = router;
