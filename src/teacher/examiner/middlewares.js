const express = require("express");
const router = express.Router();
const { CourseSession } = require("../../admin/courseSessions/model");
const CourseRegistrations = require("../../admin/courseRegistrations/model");

const saveMarks = async (req, res, next) => {
  try {
    const user = req.user;
    const courseID = req.params.courseID;
    const session = new Date(req.params.session);
    const part = req.body.part,
      students = req.body.students;

    const courseSession = await CourseSession.findOne({
      session,
    }).populate({
      path: "course",
      match: {
        courseID: { $eq: courseID },
      },
    });

    const regiList = courseSession.registrationList;
    const fullRegiList = [];
    for (const regID of regiList) {
      fullRegi = await CourseRegistrations.findById(regID);
      fullRegiList.push(fullRegi);
    }

    //console.log(fullRegiList);

    students.forEach((student) => {
      const stuID = student.studentID,
        mark = student.mark;

      const stuRegi = fullRegiList.find((reg) => reg.student === stuID);
      // console.log(stuRegi);

      if (stuRegi) {
        let section = stuRegi.termFinalMarks.find(
          (section) => section.examiner === user._id && section.part === part
        );

        if (!section) {
          section = {
            "examiner": user.id,
            "mark": Number(mark),
            "part": part,
          };
          stuRegi.termFinalMarks.push(section);
        }

        else {
          section.examiner = user.id;
          section.mark = Number(mark);
          section.part = part;
        }

        stuRegi.save();
      }
    });

    next();
  } catch (error) {
    console.log(error);
    res.sendStatus(404)
  }
};

module.exports = { saveMarks };
