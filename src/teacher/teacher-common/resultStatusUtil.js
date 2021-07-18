const constants = require('../../utils/constants');
const {CourseSession} = require("../../admin/courseSessions/model");


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


module.exports = {
	changeResultState,
	getCourseSession
}