const express = require("express");
const router = express.Router();
const { CourseSession } = require("../../admin/courseSessions/model");
const { getCorSes, getCorSes2 } = require("../examiner/helpers");
const constants = require("../../utils/constants");
const { changeResultState } = require("../teacher-common/resultStatusUtil");
const Department = require("../../admin/departments/model");

router.get("/:session", async (req, res) => {
  const user = req.user;
  
  try {
    const user = req.user;
    const session = new Date(req.params.session);

    const dept = await Department.findOne({
      head: user.id,
    });
    const deptID = dept.id;

    const courseSessions = await CourseSession.find({
      session: session,
    })
      .select("course")
      .populate({
        path: "course",
        match: {
          offeredToDepartment: deptID,
        },
        select: "courseID title",
      });
    
    const deptCS = courseSessions.filter(cs => cs.course);

    const toRet = deptCS.map((cs) => ({
      courseID: cs.course.courseID,
      courseTitle: cs.course.title,
      hasForwarded: cs.headForwarded,
      prevDone: (cs.headForwarded || cs.status === constants.RESULT_STATUS["DEPARTMENT_HEAD"]),
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

    let allApproved = true;

    if (allApproved) {

      res.send({
        hasForwarded: courseSession.headForwarded,
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
    const courseID = req.params.courseID;
    const session = new Date(req.params.session);

    const courseSession = await getCorSes2(courseID, session);

    courseSession.headForwarded = true;

    await courseSession.save();

    await changeResultState(
      courseID,
      req.params.session,
      constants[`RESULT_STATUS.DEPARTMENT_HEAD`]
    );

    res.send({ message: "hemlo" });
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

router.put("/:courseID/:session/restore", async (req, res) => {
  try {
    const courseID = req.params.courseID;
    const session = new Date(req.params.session);

    const courseSession = await getCorSes2(courseID, session);

    courseSession.headForwarded = false;

    courseSession.save();

    res.send({ message: "hemlo" });
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});

module.exports = router;
