const constants = require('../../utils/constants');
const {CourseSession} = require("../../admin/courseSessions/model");
const {CourseRegistration} = require("../../admin/courseRegistrations/model");
const {runInTransaction} = require("../../utils/helpers");

async function changeResultState(courseID, session, present_status) {


	console.log(present_status);
	console.log(courseID, session);
	const courseSession = await getCourseSession(courseID, session);

	if(courseSession.status !== present_status) return;

	let allApproved = true;

	if(present_status === constants.RESULT_STATUS.EXAMINER) {
		allApproved &= checkApprovals(courseSession, 'teachers');
	}

	allApproved &= checkApprovals(courseSession, present_status);

	if(allApproved) {

		const values = Object.values(constants.RESULT_STATUS);
		courseSession.status = values[values.indexOf(present_status) + 1 ];

		console.log("updating");
		console.log(courseSession.status);
		await courseSession.save();
	}
	return courseSession;
}

function checkApprovals(courseSession, role) {
	console.log("-=========================");
	console.log(role);
	let ret = true;

	if(Array.isArray(courseSession[role]) ) {
		courseSession[role].forEach(participant => {

			console.log(participant);
			ret &= participant.hasForwarded;
		});
	}
	else {
		console.log(courseSession[role]);
		ret &= courseSession[role].hasForwarded;
	}

	return ret;
}

async function getCourseSession(courseID, session) {
	try {
		let _ids = await CourseSession
			.find({
				session: new Date(session)
			})
			.populate({
				path: 'course',
				select: 'courseID title',
				match: {
					courseID: courseID
				}
			});

		_ids = _ids.filter(_id => _id.course);
		if (_ids) _ids = _ids[0];

		return _ids;
	} catch (error) {
		throw new Error(error);
	}
}

async function calculateResult(courseReg) {
	const courseSession = await CourseSession.findOne({_id: courseReg.courseSession});
	if(!courseSession) throw new Error("Course Session not found");

	let totalClassCount = 0, attendedClassCount = 0;
	courseSession.teachers.forEach(teacher => totalClassCount += teacher.classCount);
	courseReg.attendanceMarks.forEach(entry => attendedClassCount += entry.mark);

	let evalMarks = [], totalEvalMark = 0, obtainedEvalMark = 0;
	totalEvalMark = courseSession.consideredEvalCount * 20;
	courseReg.evalMarks.forEach(entry => evalMarks.push(entry.mark));
	evalMarks = evalMarks.sort().reverse().slice(0, courseSession.consideredEvalCount);
	evalMarks.forEach(mark => obtainedEvalMark += mark);


	let tfTotalMark = 0, tfObtainedMark = 0;
	courseSession.examiners.forEach(examiner => tfTotalMark += examiner.totalMarks);
	courseReg.termFinalMarks.forEach(entry => tfObtainedMark += entry.mark);

	let percentage = 0;
	percentage += (attendedClassCount / totalClassCount) * 10.0;
	percentage += (obtainedEvalMark / totalEvalMark ) * 20.0;
	percentage += (tfObtainedMark / tfTotalMark) * 70.0;

	let gradeLetter, gradePoint;
	if(percentage >= 80.0) { gradeLetter = 'A+'; gradePoint = 4.00; }
	else if(percentage >= 75.0) { gradeLetter = 'A' ; gradePoint = 3.75; }
	else if(percentage >= 70.0) { gradeLetter = 'A-' ; gradePoint = 3.50; }
	else if(percentage >= 65.0) { gradeLetter = 'B+' ; gradePoint = 3.25; }
	else if(percentage >= 60.0) { gradeLetter = 'B' ; gradePoint = 3.00; }
	else if(percentage >= 55.0) { gradeLetter = 'B-' ; gradePoint = 2.75; }
	else if(percentage >= 50.0) { gradeLetter = 'C+' ; gradePoint = 2.50; }
	else if(percentage >= 45.0) { gradeLetter = 'C' ; gradePoint = 2.25; }
	else if(percentage >= 40.0) { gradeLetter = 'D' ; gradePoint = 2.00; }
	else { gradeLetter = 'F' ; gradePoint = 0.00; }


	return {
		gradePoint,
		gradeLetter,
		percentage
	}
}

async function publishResult() {
	try {
		const registrations = [];
		const students = await CourseRegistration.find({status: constants.COURSE_REGISTRATION_STATUS.REGISTERED} );

		await students.eachAsync(courseReg => {

			const result = calculateResult(courseReg);
			const courseRegistration = {
				updateOne: {
					filter: { _id: courseReg._id },
					update: {
						result,
						status: (result.gradeLetter === 'F' ? constants.COURSE_REGISTRATION_STATUS.FAILED: constants.COURSE_REGISTRATION_STATUS.PASSED),
					},
					upsert: false
				}
			}
			registrations.push(courseRegistration);
		});
		const res = await runInTransaction(registrations, CourseRegistration);
		console.log("modified Count: " + res.modifiedCount);
		return res;

	} catch(error) {
		throw new Error(error);
	}
}



module.exports = {
	changeResultState,
	getCourseSession,
	publishResult
}