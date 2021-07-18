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
      select: "credit",
    })
    .populate({
      path: "teachers.teacher",
      select: "name",
    })
    .populate({
      path: "examiners.teacher",
      select: "name",
    })
    .populate({
      path: "scrutinizers.teacher",
      select: "name",
    })
    .populate({
      path: "internals.teacher",
      select: "name",
    })
    .populate({
      path: "registrationList",
      select: "attendanceMarks evalMarks termFinalMarks student",
      // match: { status: { $eq: "registered" } }, // NEED TO CHANGE 'OFFERED' TO 'REGISTERED'
      populate: {
        path: "student",
        select: "name",
      }
    });

  const cs = courseSessions.find((cs) => cs.course);

  cs.registrationList.sort((a, b) => (a.student.id < b.student.id ? -1 : 1));

  cs.names = {};

  for (const teacher of cs.teachers)
    cs.names[teacher.teacher.id] = teacher.teacher.name;
  for (const examiner of cs.examiners)
    cs.names[examiner.teacher.id] = examiner.teacher.name;
  for (const scrutinizer of cs.scrutinizers)
    cs.names[scrutinizer.teacher.id] = scrutinizer.teacher.name;
  for (const internal of cs.internals)
    cs.names[internal.teacher.id] = internal.teacher.name;

  for (const teacher of cs.teachers) teacher.teacher = teacher.teacher.id;
  for (const examiner of cs.examiners) examiner.teacher = examiner.teacher.id;
  for (const scrutinizer of cs.scrutinizers) scrutinizer.teacher = scrutinizer.teacher.id;
  for (const internal of cs.internals) internal.teacher = internal.teacher.id;

  return cs;
};

const getCorSes2 = async (courseID, session) => {
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
      select: "attendanceMarks evalMarks termFinalMarks student",
      // match: { status: { $eq: "registered" } }, // NEED TO CHANGE 'OFFERED' TO 'REGISTERED'
      populate: {
        path: "student",
        select: "name",
      },
    });

  const cs = courseSessions.find((cs) => cs.course);
  return cs;
};

module.exports = {
  getCorSes, getCorSes2
};
