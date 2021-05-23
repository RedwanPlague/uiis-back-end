const express = require("express");
const router = express.Router();
const { CourseSession } = require("../../admin/courseSessions/model");
const Courses = require("../../admin/courses/model");
const CourseRegistrations = require("../../admin/courseRegistrations/model");

router.get("/:session", async (req, res) => {
  const user = req.user;

  const session = new Date(req.params.session);

  courseSessions = await CourseSession.find({
    session: session,
    "scrutinizers.teacher": req.user.id,
  }).populate("course");

  const toRet = [];

  for (const courseSession of courseSessions) {
    const sections = courseSession.scrutinizers.filter(
      (scrutinizer) => scrutinizer.teacher === user._id
    );

    for (const section of sections) {
      toRet.push({
        courseID: courseSession.course.courseID,
        courseTitle: courseSession.course.title,
      });
    }
  }

  res.send({ toRet });
});

router.get("/:courseID/:session", async (req, res) => {
  const user = req.user;
  const courseID = req.params.courseID;
  const session = new Date(req.params.session);

  const courseSession = await CourseSession.findOne({
    session,
  }).populate({
    path: "course",
    match: {
      courseID: { $eq: courseID },
    },
  });

  const regiList = courseSession.registrationList;
  const section = courseSession.scrutinizers.find(scrutinizer => scrutinizer.teacher === user._id);

  const students = [];

  for (const regID of regiList) {
    const regi = await CourseRegistrations.findById(regID).populate("student");
    students.push(regi);
  }

  res.send({students});
});

router.put("/:courseID/:session/approve", async (req, res) => {

    const user = req.user;
    const courseID = req.params.courseID;
    const session = new Date(req.params.session);
  
    const courseSession = await CourseSession.findOne({
      session,
    }).populate({
      path: "course",
      match: {
        "courseID": { "$eq": courseID}
      }
    });
  
    const section = courseSession.scrutinizers.find(
      scrutinizer => scrutinizer.teacher === user._id
    );
  
    if(section) {
      section.hasApprovedResult = true;
    }
  
    courseSession.save();
  
    res.send({"message": "hemlo"});
});

module.exports = router;
