const express = require("express");
const router = express.Router();
const { CourseSession } = require("../../admin/courseSessions/model");
const { CourseRegistration } = require("../../admin/courseRegistrations/model");
const { getCorSes, getCorSes2 } = require("../examiner/helpers");

router.get("/:session", async (req, res) => {
  try {
    const user = req.user;
    const session = new Date(req.params.session);

    courseSessions = await CourseSession.find({
      session: session,
      "scrutinizers.teacher": user.id,
    })
      .select("course")
      .populate({
        path: "course",
        select: "courseID title",
      });

    const toRet = courseSessions.map((cs) => ({
      courseID: cs.course.courseID,
      courseTitle: cs.course.title,
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

      const section = courseSession.scrutinizers.find(
        (scrutinizer) => scrutinizer.teacher === user.id
      );

      res.send({
        hasApprovedResult: section.hasApprovedResult,
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
    res.status(404).send(error);
  }
});

router.put("/:courseID/:session/approve", async (req, res) => {
  try {
    const user = req.user;
    const courseID = req.params.courseID;
    const session = new Date(req.params.session);

    const courseSession = await getCorSes2(courseID, session);

    const section = courseSession.scrutinizers.find(
      (scrutinizer) => scrutinizer.teacher === user.id
    );

    if (section) {
      section.hasApprovedResult = true;
    }

    courseSession.save();

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

    const section = courseSession.scrutinizers.find(
      (scrutinizer) => scrutinizer.teacher === user.id
    );

    if (section) {
      section.hasApprovedResult = false;
    }

    courseSession.save();

    res.send({ message: "hemlo" });
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

module.exports = router;
