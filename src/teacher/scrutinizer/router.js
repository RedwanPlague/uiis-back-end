const express = require("express");
const router = express.Router();
const { CourseSession } = require("../../admin/courseSessions/model");
const Courses = require("../../admin/courses/model");
const CourseRegistrations = require("../../admin/courseRegistrations/model");
const { getCS } = require("../examiner/helpers");

router.get("/:session", async (req, res) => {
  try {
    const user = req.user;

    const session = new Date(req.params.session);

    courseSessions = await CourseSession.find({
      session: session,
      "scrutinizers.teacher": req.user.id,
    }).populate("course");

    const toRet = courseSessions.map((cs) => ({
      courseID: cs.course.courseID,
      courseTitle: cs.course.title,
    }));

    res.send({ toRet });
  } catch (error) {
    res.sendStatus(404);
  }
});

router.get("/:courseID/:session", async (req, res) => {
  try {
    const user = req.user;
    const courseID = req.params.courseID;
    const session = new Date(req.params.session);

    const courseSession = await getCS(courseID, session);

    const regiList = courseSession.registrationList;

    const students = [];

    for (const regID of regiList) {
      const regi = await CourseRegistrations.findById(regID).populate(
        "student"
      );
      students.push(regi);
    }

    res.send({ students });
  } catch (error) {
    res.sendStatus(404);
  }
});

router.put("/:courseID/:session/approve", async (req, res) => {
  try {
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

    const section = courseSession.scrutinizers.find(
      (scrutinizer) => scrutinizer.teacher === user._id
    );

    if (section) {
      section.hasApprovedResult = true;
    }

    courseSession.save();

    res.send({ message: "hemlo" });
  } catch (error) {
    res.sendStatus(404);
  }
});

module.exports = router;
