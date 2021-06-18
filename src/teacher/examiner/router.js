const express = require("express");
const router = express.Router();
const { CourseSession } = require("../../admin/courseSessions/model");
const { Issues } = require("../issues/model");
const { saveMarks } = require("./middlewares");
const { getCorSes, getCorSes2 } = require("./helpers");
const constants = require("../../utils/constants");

router.get("/:session", async (req, res) => {
  try {
    const user = req.user;
    const session = new Date(req.params.session); // might need to be changed

    courseSessions = await CourseSession.find({
      session,
      "examiners.teacher": user.id,
    })
      .select("course examiners session")
      .populate({
        path: "course",
        select: "courseID title",
      });

    const toRet = [];

    for (const courseSession of courseSessions) {
      const sections = courseSession.examiners.filter(
        (examiner) => examiner.teacher === user.id
      );

      const notun = sections.map((section) => ({
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
    const hasForwarded = section.hasForwarded;

    const students = courseSession.registrationList.map((regi) => {
      const studentID = regi.student.id;
      const studentName = regi.student.name;

      const section = regi.termFinalMarks.find(
        (section) => section.examiner === user.id && section.part === part
      );

      const mark = section ? section.mark : "";
      const editAccess = section ? section.editAccess : true;

      return { studentID, studentName, mark, editAccess };
    });

    res.send({ totalMarks, hasForwarded, students });
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

router.put("/:courseID/:session/save", saveMarks, async (req, res) => {
  try {
    const user = req.user;
    const courseID = req.params.courseID;
    const session = new Date(req.params.session);
    const part = req.body.part;

    const courseSession = await getCorSes2(courseID, session);

    const section = courseSession.examiners.find(
      (examiner) => examiner.part === part && examiner.teacher === user.id
    );


    if (section) {
      if (section.hasForwarded) {
        const issues = await Issues.find({
          evalType: "term-final-eval",
          part: part,
          evalOwner: user.id,
          courseSession: courseSession._id,
          status: constants.ISSUE_STATUS.UNRESOLVED,
        });

        issues.forEach((issue) => {
          issue.posts.push({
            postType: "Mark update",
            author: user.id,
            date: Date.now,
            description: `${user.id} updated marks in ${courseID} - part ${part}`,
            imageLink: 'https://avatars.githubusercontent.com/u/32516061?s=80&amp;v=4',
          });

          issue.save();
        });
      }
    }

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

    const courseSession = await getCorSes2(courseID, session);

    const section = courseSession.examiners.find(
      (examiner) => examiner.part === part && examiner.teacher === user.id
    );

    console.log(section);

    if (section) {
      section.hasForwarded = true;
    }

    const regiList = courseSession.registrationList;
    regiList.forEach(regi => {
      const ami = regi.termFinalMarks.find(tf => tf.examiner === user.id && tf.part === part);
      if(ami) ami.editAccess = false;
      regi.save();
    })

    courseSession.save();

    res.send(req.body);
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
    const part = req.body.part;

    const courseSession = await getCorSes2(courseID, session);

    const section = courseSession.examiners.find(
      (examiner) => examiner.part === part && examiner.teacher === user.id
    );

    if (section) {
      section.hasForwarded = false;
    }

    const regiList = courseSession.registrationList;
    regiList.forEach(regi => {
      const ami = regi.termFinalMarks.find(tf => tf.examiner === user.id && tf.part === part);
      if(ami) ami.editAccess = true;
      regi.save();
    })

    courseSession.save();

    res.send(req.body);
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

module.exports = router;
