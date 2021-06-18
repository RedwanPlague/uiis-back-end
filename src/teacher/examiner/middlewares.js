const { getCorSes } = require("./helpers");

const saveMarks = async (req, res, next) => {
  try {
    const user = req.user;
    const courseID = req.params.courseID;
    const session = new Date(req.params.session);
    const part = req.body.part,
      students = req.body.students;

    const courseSession = await getCorSes(courseID, session);

    const regiList = courseSession.registrationList;

    students.forEach((student) => {
      const stuID = student.studentID,
        mark = student.mark;

      const stuRegi = regiList.find((reg) => reg.student.id === stuID);

      if (stuRegi) {
        let section = stuRegi.termFinalMarks.find(
          (section) => section.examiner === user.id && section.part === part
        );

        if (!section) {
          section = {
            "examiner": user.id,
            "mark": Number(mark),
            "part": part,
            "editAccess": true,
          };
          stuRegi.termFinalMarks.push(section);
        }

        else section.mark = Number(mark);

        stuRegi.save();
      }
    });

    next();
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
};

module.exports = { saveMarks };
