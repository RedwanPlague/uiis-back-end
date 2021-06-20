const {Issues} = require('./model');
const constants = require('../../utils/constants');
const {CourseRegistration} = require("../../admin/courseRegistrations/model");

async function addMarkUpdateActivity(studentList, evalOwnerID, evalType, part) {
	const issues = await Issues
		.find({evalOwner: evalOwnerID, students: {  $in: studentList}, evalType, part } );

	for(let i = 0 ; i < issues.length ; i++ ) {
		const entry = issues[i];
		entry.students.forEach( student => {
			if(studentList.includes(student)) {
				entry.posts.push({
					postType: constants.ISSUE_POST_TYPE.ACTIVITY,
					author: evalOwnerID,
					date: new Date(),
					description: `updated the mark of ${student}`
				});
			}
		});
		await entry.save();
	}
}

async function removeEditAccess(courseSession, studentList, evalType, part, evalOwnerID) {
	try {
		console.log(studentList);
		const issues = await Issues
			.find({
				evalOwner: evalOwnerID,
				students: {$in: studentList},
				evalType,
				part,
				status: constants.ISSUE_STATUS.UNRESOLVED
			});


		const accessRemovalList = [];
		studentList.forEach(student => {
			let issueExist = false;
			issues.forEach(issue => issueExist |= issue.students.includes(student));
			if (!issueExist) accessRemovalList.push(student);
		});
		console.log(accessRemovalList);

		await setEditStatus(courseSession, accessRemovalList, evalType, part, evalOwnerID, false);
	} catch (error) {
		throw error;
	}
}

async function setEditStatus(courseSession, studentList, evalType, part, evalOwnerID, accessStatus) {

	try {
		const courseRegistrations = await CourseRegistration
			.find({'_id': {$in: courseSession.registrationList}, 'student': {$in: studentList}});


		for (let i = 0; i < courseRegistrations.length; i++) {
			const entry = courseRegistrations[i];

			if (evalType === constants.ISSUE_EVAL_TYPE.COURSE_EVAL) {
				for(let j = 0 ; j < entry.evalMarks.length ; j++) {
					if(entry.evalMarks[j].teacher === evalOwnerID) {
						entry.evalMarks[j].editAccess = accessStatus;
					}
				}
			} else if (evalType === constants.ISSUE_EVAL_TYPE.TF_EVAL) {
				for(let j = 0 ; j < entry.termFinalMarks.length ; j++) {
					if(entry.termFinalMarks[j].part === part && entry.termFinalMarks[j].examiner === evalOwnerID) {
						entry.termFinalMarks[j].editAccess = accessStatus;
					}
				}
			}
			await entry.save();
		}
		// for testing
		// const tmp = await CourseRegistration
		// 	.find({'_id': {$in: courseSession.registrationList}, 'student': {$in: studentList}});
		// console.log("---------------");
		//
		// tmp.forEach(entry => {
		// 	console.log(entry.student)
		// 	console.log(entry.evalMarks);
		// });
	} catch (error) {
		throw error;
	}
}

module.exports = {
	addMarkUpdateActivity,
	setEditStatus,
	removeEditAccess
}