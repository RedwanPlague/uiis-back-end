const express = require("express");
const router = express.Router();
const { CourseSession } = require("../../admin/courseSessions/model");
const { getCorSes, getCorSes2 } = require("../examiner/helpers");
const constants = require("../../utils/constants");
const { changeResultState } = require("../teacher-common/resultStatusUtil");
const Department = require("../../admin/departments/model");
const { get_marked_student_list } = require("../issues/service");

router.get("/:session", async (req, res) => {
  const user = req.user;

  try {
    const user = req.user;
    const session = new Date(`${req.params.session} UTC`);

    const dept = await Department.findOne({
      head: user.id,
    });
    const deptID = dept.id;

    const courseSessions = await CourseSession.find({
      session: session,
    })
      .select("course status headForwarded")
      .populate({
        path: "course",
        match: {
          offeredToDepartment: deptID,
        },
        select: "courseID title",
      });

    const deptCS = courseSessions.filter(cs => cs.course);
    const toRet = deptCS.map((cs) => ({
      courseID: cs.course.courseID,
      courseTitle: cs.course.title,
      hasForwarded: cs.headForwarded,
      prevDone: (cs.headForwarded || cs.status === constants.RESULT_STATUS.DEPARTMENT_HEAD),
    }));

    //console.log(toRet);

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

    let allApproved = true;

    if (allApproved) {

      const teacherColored = [];
      for(const teacher of courseSession.teachers) {
        const colored = await get_marked_student_list(user.id, courseID, session, "-", teacher.teacher);
        teacherColored.push({
          teacher: teacher.teacher,
          unchangedList: colored.unchanged_list,
          updatedList: colored.updated_list,
        });
      }

      const examinerColored = [];
      for(const examiner of courseSession.examiners) {
        const colored = await get_marked_student_list(user.id, courseID, session, examiner.part, examiner.teacher);
        examinerColored.push({
          teacher: examiner.teacher,
          part: examiner.part,
          unchangedList: colored.unchanged_list,
          updatedList: colored.updated_list,
        });
      }

      res.send({
        hasForwarded: courseSession.headForwarded,
        names: courseSession.names,
        teachers: courseSession.teachers,
        examiners: courseSession.examiners,
        students: courseSession.registrationList,
        credit: courseSession.course.credit,
        perEvalWeight:courseSession.perEvalWeight,
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

router.put("/:courseID/:session/approve", async (req, res) => {
  try {
    const courseID = req.params.courseID;
    const session = new Date(`${req.params.session} UTC`);

    const courseSession = await getCorSes2(courseID, session);

    courseSession.headForwarded = true;

    await courseSession.save();

    await changeResultState(
      courseID,
      session,
      constants.RESULT_STATUS.DEPARTMENT_HEAD
    );

    res.send({ message: "hemlo" });
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

router.put("/:courseID/:session/restore", async (req, res) => {
  try {
    const courseID = req.params.courseID;
    const session = new Date(`${req.params.session} UTC`);

    const courseSession = await getCorSes2(courseID, session);

    courseSession.headForwarded = false;

    courseSession.save();

    res.send({ message: "hemlo" });
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

router.put("/:courseID/:session/setmarks", async (req, res) => {
  try {
    const courseID = req.params.courseID;
    const session = new Date(`${req.params.session} UTC`);

    const courseSessions = await CourseSession.find({
      session,
    })
      .populate({
        path: "course",
        match: {
          courseID: { $eq: courseID },
        },
        select: "credit",
      });
    
    const cs = courseSessions.find(cs => cs.course);
    const credit = cs.course.credit;

    cs.perEvalWeight = 20/(2*credit-2); // I know this is khaishta but sorry
    cs.totalEvalCount = 2*credit;
    cs.consideredEvalCount = 2*credit-2;
    cs.attendanceWeight = 10;
    cs.termFinalParts = 2;
    cs.totalMarks = 100*credit;

    await cs.save();

    res.send(cs);
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

module.exports = router;
