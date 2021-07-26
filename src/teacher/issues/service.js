const {Issues} = require('./model');
const constants = require('../../utils/constants');
const {CourseRegistration} = require("../../admin/courseRegistrations/model");

async function addMarkUpdateActivity(studentList, evalOwnerID, evalType, part, courseSession) {
	const issues = await Issues
		.find({
			evalOwner: evalOwnerID,
			courseSession: courseSession._id,
			students: {  $in: studentList}, evalType, part
		} );

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
		const issues = await Issues
			.find({
				evalOwner: evalOwnerID,
				students: {$in: studentList},
				evalType,
				part,
				status: constants.ISSUE_STATUS.UNRESOLVED,
				courseSession: courseSession._id,
			});


		const accessRemovalList = [];
		studentList.forEach(student => {
			let issueExist = false;
			issues.forEach(issue => issueExist |= issue.students.includes(student));
			if (!issueExist) accessRemovalList.push(student);
		});

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



async function get_marked_student_list(teacherID, courseID, session, part, evalOwner) {

	try {
		let issues = await Issues
			.find({teachers: teacherID, status: constants.ISSUE_STATUS.UNRESOLVED, part: part, evalOwner: evalOwner})
			.lean()
			.select('students posts')
			.populate({
				path: 'courseSession',
				populate: {
					path: 'course',
					match: { courseID: courseID }
				},
				match: { session: session }
			});
		issues = issues.filter(issue => issue.courseSession);
		let unchanged_list = [], union_list = [];

		issues.forEach(issue => {

			union_list = union_list.concat(issue.students);
			let unchanged_current_list = issue.students;

			let done = false;
			issue.posts.slice().reverse().forEach(post => {
				if(post.postType !== constants.ISSUE_POST_TYPE.ACTIVITY) return;
				if(done) return;

				const descriptionType = post.description.split(" ")[0];
				if(descriptionType === "reopened") done =  true;
				else if(descriptionType === "updated") {
					const student_id = post.description.split(" ")[4];
					unchanged_current_list = unchanged_current_list.filter( student => (student !== student_id) );
				}
			});
			unchanged_list = unchanged_list.concat(unchanged_current_list);
		});
		let updated_list = union_list.filter(student => !unchanged_list.includes(student));

		unchanged_list = [...new Set(unchanged_list)];
		updated_list = [...new Set(updated_list)];

		return {
			unchanged_list,
			updated_list
		}
	} catch (error) {
		console.log(error);
	}
}

module.exports = {
	addMarkUpdateActivity,
	setEditStatus,
	removeEditAccess,
	get_marked_student_list
}