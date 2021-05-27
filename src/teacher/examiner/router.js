const express = require("express");
const router = express.Router();
const { CourseSession } = require("../../admin/courseSessions/model");
const CourseRegistrations = require("../../admin/courseRegistrations/model");
const {saveMarks} = require("./middlewares");

router.get("/:session", async (req, res) => {
  const user = req.user;
  const session = new Date(req.params.session); // might need to be changed

  courseSessions = await CourseSession.find({
    "session": session,
    "examiners.teacher": req.user.id,
  }).populate("course");

  const toRet = [];
  
  for(const courseSession of courseSessions) {
    const sections = courseSession.examiners.filter(examiner => examiner.teacher === req.user.id);

    for(const section of sections) {
      toRet.push({
        "courseID": courseSession.course.courseID,
        "courseTitle": courseSession.course.title,
        "part": section.part,
      });
    }
  }

  res.send({toRet});
});

router.get("/:courseID/:session", async (req, res) => {
  const user = req.user;
  const courseID = req.params.courseID;
  const session = new Date(req.params.session);
  const part = req.query.part;

  const courseSession = await CourseSession.findOne({
    session,
  }).populate({
    path: "course",
    match: {
      "courseID": { "$eq": courseID}
    }
  });

  const regiList = courseSession.registrationList;
  const section = courseSession.examiners.find(
    examiner => examiner.part === part && examiner.teacher === user._id);
  const totalMarks = section.totalMarks;
  const editAccess = section.resultEditAccess;

  const students = [];

  for(const regID of regiList) {
    const regi = await CourseRegistrations.findById(regID).populate("student");
    const studentID = regi.student._id;
    const studentName = regi.student.name;

    const section = regi.termFinalMarks.find(
      section => section.examiner === user._id && section.part === part
    );

    const mark = section? section.mark: -1;

    students.push({studentID, studentName, mark});
  }

  res.send({totalMarks, editAccess, students});
});

router.put("/:courseID/:session/save", saveMarks, async (req, res) => {
  try {
    res.send({"message": "hemlo"});
  }
  catch(error) {
    res.sendStatus(404);
  }
  
});

router.put("/:courseID/:session/forward", saveMarks, async (req, res) => {

  const user = req.user;
  const courseID = req.params.courseID;
  const session = new Date(req.params.session);
  const part = req.body.part, students = req.body.students;

  const courseSession = await CourseSession.findOne({
    session,
  }).populate({
    path: "course",
    match: {
      "courseID": { "$eq": courseID}
    }
  });

  const section = courseSession.examiners.find(
    examiner => examiner.part === part && examiner.teacher === user._id
  );

  if(section) {
    section.resultEditAccess = false;
  }

  courseSession.save();

  res.send({"message": "hemlo"});
});

module.exports = router;
