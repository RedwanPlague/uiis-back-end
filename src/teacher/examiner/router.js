const express = require("express");
const router = express.Router();
const { CourseSession } = require("../../admin/courseSessions/model");
const { Issues } = require("../issues/model");
const { addMarkUpdateActivity } = require("../issues/service");
const { saveMarks } = require("./middlewares");
const { getCorSes, getCorSes2 } = require("./helpers");
const constants = require("../../utils/constants");
const { changeResultState } = require("../teacher-common/resultStatusUtil");

router.get("/:session", async (req, res) => {
  try {
    const user = req.user;
    const session = new Date(`${req.params.session}`);

    const courseSessions = await CourseSession.find({
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
    const session = new Date(`${req.params.session}`);
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
    const session = new Date(`${req.params.session}`);
    const part = req.body.part;

    const courseSession = await getCorSes2(courseID, session);

    const section = courseSession.examiners.find(
      (examiner) => examiner.part === part && examiner.teacher === user.id
    );

    if (section) {
      if (section.hasForwarded) {
        await addMarkUpdateActivity(
          req.modStuList,
          user.id,
          constants.ISSUE_EVAL_TYPE.TF_EVAL,
          part,
          courseSession
        );
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
    const session = new Date(`${req.params.session}`);
    const part = req.body.part;

    const courseSession = await getCorSes2(courseID, session);

    const section = courseSession.examiners.find(
      (examiner) => examiner.part === part && examiner.teacher === user.id
    );

    if (section) {
      section.hasForwarded = true;
    }

    const regiList = courseSession.registrationList;
    for (const regi of regiList) {
      const ami = regi.termFinalMarks.find(
        (tf) => tf.examiner === user.id && tf.part === part
      );
      if (ami) ami.editAccess = false;
      await regi.save();
    };

    await courseSession.save();

    await changeResultState(
      courseID,
      session,
      constants.RESULT_STATUS.EXAMINER
    );

    res.send(req.body);
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

router.put("/:courseID/:session/fill", async (req, res) => {
  try {
    const courseID = req.params.courseID;
    const session = new Date(`${req.params.session}`);

    const courseSession = await getCorSes(courseID, session);

    for(const section of courseSession.examiners) {
      // section.hasForwarded = true;

      const regiList = courseSession.registrationList;
      for (const regi of regiList) {
        let ami = regi.termFinalMarks.find(
          (tf) => tf.examiner === section.teacher && tf.part === section.part
        );
        if (ami) {
          ami.mark =  Math.floor(Math.random()*15+90);
        }
        else {
          ami = {
            examiner: section.teacher,
            mark: Math.floor(Math.random()*15+90),
            part: section.part,
            editAccess: true,
          };
          regi.termFinalMarks.push(ami);
        }
        await regi.save();
      }
    }

    await courseSession.save();

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
    const session = new Date(`${req.params.session}`);
    const part = req.body.part;

    const courseSession = await getCorSes2(courseID, session);

    const section = courseSession.examiners.find(
      (examiner) => examiner.part === part && examiner.teacher === user.id
    );

    if (section) {
      section.hasForwarded = false;
    }

    const regiList = courseSession.registrationList;
    regiList.forEach((regi) => {
      const ami = regi.termFinalMarks.find(
        (tf) => tf.examiner === user.id && tf.part === part
      );
      if (ami) ami.editAccess = true;
      regi.save();
    });

    courseSession.save();

    res.send(req.body);
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

module.exports = router;
