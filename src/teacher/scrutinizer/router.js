const express = require("express");
const router = express.Router();
const { CourseSession } = require("../../admin/courseSessions/model");
const { CourseRegistration } = require("../../admin/courseRegistrations/model");
const { getCorSes, getCorSes2 } = require("../examiner/helpers");
const constants = require("../../utils/constants");
const { changeResultState } = require("../teacher-common/resultStatusUtil");
const { setKe } = require("./middlewares");

router.use(setKe);

router.get("/:session", async (req, res) => {
  try {
    const user = req.user;
    const session = new Date(req.params.session);

    courseSessions = await CourseSession.find({
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
    const session = new Date(req.params.session);
    const user = req.user;

    const courseSession = await getCorSes(courseID, session);

    let allApproved = true;
    // courseSession.teachers.forEach(teacher => {
    //   allApproved = (allApproved && !teacher.editAccess);
    // });
    // courseSession.examiners.forEach(examiner => {
    //   allApproved = (allApproved && !examiner.resultEditAccess);
    // });

    if (allApproved) {
      // let attendanceCount = 0;
      // let evalTotalMarks = [];
      // let tfTotalMarks = courseSession.examiners;

      // courseSession.teachers.forEach(teacher => {
      //   attendanceCount += teacher.classCount;
      //   evalTotalMarks.push(...teacher.evalDescriptions);
      // });

      // const totalMarks = {
      //   attendanceCount,
      //   evalTotalMarks,
      //   tfTotalMarks,
      // };

      const section = courseSession[`${req.ke}s`].find(
        (who) => who.teacher === user.id
      );

      res.send({
        hasForwarded: section.hasForwarded,
        names: courseSession.names,
        teachers: courseSession.teachers,
        examiners: courseSession.examiners,
        students: courseSession.registrationList,
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
    const session = new Date(req.params.session);

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
      req.params.session,
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
    const session = new Date(req.params.session);

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
