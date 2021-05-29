const express = require("express");
const router = express.Router();
const { CourseSession } = require("../../admin/courseSessions/model");
const { CourseRegistration } = require("../../admin/courseRegistrations/model");
const { getCorSes } = require("../examiner/helpers");

router.get("/:session", async (req, res) => {
  try {
    const user = req.user;
    const session = new Date(req.params.session);

    courseSessions = await CourseSession.find({
      session: session,
      "scrutinizers.teacher": user.id,
    }).select("course")
    .populate({
      path: "course",
      select: "courseID title"
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

    const courseSession = await getCorSes(courseID, session);

    res.send({ students: courseSession.registrationList, });
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

    const courseSession = await getCorSes(courseID, session);

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

module.exports = router;
