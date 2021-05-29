const express = require("express");
const router = express.Router();
const { CourseSession } = require("../../admin/courseSessions/model");
const { saveMarks } = require("./middlewares");
const { getCorSes } = require("./helpers");

router.get("/:session", async (req, res) => {
  try {
    const user = req.user;
    const session = new Date(req.params.session); // might need to be changed

    courseSessions = await CourseSession.find({
      session: session,
      "examiners.teacher": user.id,
    }).select("course examiners")
    .populate({
      path: "course",
      select: "courseID title"
    });

    const toRet = [];

    for (const courseSession of courseSessions) {
      const sections = courseSession.examiners.filter(
        (examiner) => examiner.teacher === user.id
      );

      const notun = sections.map(section => ({
        courseID: courseSession.course.courseID,
        courseTitle: courseSession.course.title,
        part: section.part,
      }));

      toRet.push(...notun);
    }

    res.send({ toRet });
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

router.get("/:courseID/:session", async (req, res) => {
  try {
    const user = req.user;
    const courseID = req.params.courseID;
    const session = new Date(req.params.session);
    const part = req.query.part;

    const courseSession = await getCorSes(courseID, session);

    const section = courseSession.examiners.find(
      (examiner) => examiner.part === part && examiner.teacher === user.id
    );
    const totalMarks = section.totalMarks;
    const editAccess = section.resultEditAccess;

    console.log(courseSession);

    const students = courseSession.registrationList.map(regi => {
      const studentID = regi.student.id;
      const studentName = regi.student.name;

      const section = regi.termFinalMarks.find(
        (section) => section.examiner === user.id && section.part === part
      );

      const mark = section ? section.mark : -1;

      return ({ studentID, studentName, mark });
    });

    res.send({ totalMarks, editAccess, students });
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

router.put("/:courseID/:session/save", saveMarks, async (req, res) => {
  try {
    res.send(req.body);
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

router.put("/:courseID/:session/forward", saveMarks, async (req, res) => {
  try {
    const user = req.user;
    const courseID = req.params.courseID;
    const session = new Date(req.params.session);
    const part = req.body.part;

    const courseSession = await getCorSes(courseID, session);

    const section = courseSession.examiners.find(
      (examiner) => examiner.part === part && examiner.teacher === user.id
    );

    if (section) {
      section.resultEditAccess = false;
    }

    courseSession.save();

    res.send(req.body);
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

module.exports = router;
