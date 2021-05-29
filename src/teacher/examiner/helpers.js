const { CourseSession } = require("../../admin/courseSessions/model");

const getCorSes = async (courseID, session) => {
  const courseSessions = await CourseSession.find({
    session,
  })
    .populate({
      path: "course",
      match: {
        courseID: { $eq: courseID },
      },
    })
    .populate({
      path: "registrationList",
      select: "termFinalMarks student",
      match: { status: { $eq: "offered" } }, // NEED TO CHANGE 'OFFERED' TO 'REGISTERED'
      populate: {
        path: "student",
        select: "name",
      },
    });

  return courseSessions.find((cs) => cs.course);
};

module.exports = {
  getCorSes,
};
