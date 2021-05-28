const { CourseSession } = require("../../admin/courseSessions/model");

const getCS = async (courseID, session) => {
    const courseSessions = await CourseSession.find({
        session,
      }).populate({
        path: "course",
        match: {
          "courseID": { $eq: courseID },
        },
    });

    return courseSessions.find(cs => cs.course);
}

module.exports = {
    getCS,
}