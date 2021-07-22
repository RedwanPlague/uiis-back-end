const express = require("express");
const router = express.Router();
const { CourseSession } = require("../../admin/courseSessions/model");
const { CourseRegistration } = require("../../admin/courseRegistrations/model");
const { getCorSes, getCorSes2 } = require("../examiner/helpers");
const constants = require("../../utils/constants");
const { changeResultState } = require("../teacher-common/resultStatusUtil");
const { setKe } = require("./middlewares");
const { get_marked_student_list } = require("../issues/service");

router.use(setKe);

router.get("/:session", async (req, res) => {
  try {
    const user = req.user;
    const session = new Date(`${req.params.session} UTC`);

    const courseSessions = await CourseSession.find({
      session: session,
      [`${req.ke}s.teacher`]: user.id,
    })
      .select("course status")
      .populate({
        path: "course",
        select: "courseID title",
      })
      .populate("scrutinizers internals");

    const toRet = courseSessions.map((cs) => {
      const section = cs[`${req.ke}s`].find(
        (who) => who.teacher === user.id
      );

      const prevDone = section.hasForwarded || cs.status === constants.RESULT_STATUS[req.ke.toUpperCase()];

      const cr = {
        courseID: cs.course.courseID,
        courseTitle: cs.course.title,
        hasForwarded: section.hasForwarded,
        prevDone,
      }

      return cr;
    });

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
      const section = courseSession[`${req.ke}s`].find(
        (who) => who.teacher === user.id
      );

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
        hasForwarded: section.hasForwarded,
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
    const user = req.user;
    const courseID = req.params.courseID;
    const session = new Date(`${req.params.session} UTC`);

    const courseSession = await getCorSes2(courseID, session);

    const section = courseSession[`${req.ke}s`].find(
      (who) => who.teacher === user.id
    );

    if (section) {
      section.hasForwarded = true;
    }

    await courseSession.save();

    await changeResultState(
      courseID,
      session,
      constants.RESULT_STATUS[req.ke.toUpperCase()]
    );

    res.send({ message: "hemlo" });
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

router.put("/:courseID/:session/restore", async (req, res) => {
  try {
    const user = req.user;
    const courseID = req.params.courseID;
    const session = new Date(`${req.params.session} UTC`);

    const courseSession = await getCorSes2(courseID, session);

    const section = courseSession[`${req.ke}s`].find(
      (who) => who.teacher === user.id
    );

    if (section) {
      section.hasForwarded = false;
    }

    courseSession.save();

    res.send({ message: "hemlo" });
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

module.exports = router;
