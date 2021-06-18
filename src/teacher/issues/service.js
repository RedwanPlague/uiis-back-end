const {Issues} = require('./model');
const constants = require('../../utils/constants');

async function addIssueActivity(studentList, userID, evalType, part) {
	const issues = await Issues
		.find({evalOwner: userID, students: {  $in: studentList}, evalType } );


	for(let i = 0 ; i < issues.length ; i++ ) {
		const entry = issues[i];
		if(entry.evalType === constants.ISSUE_EVAL_TYPE.TF_EVAL && entry.part !== part) continue;
		entry.students.forEach( student => {
			if(studentList.includes(student)) {
				entry.posts.push({
					postType: constants.ISSUE_POST_TYPE.ACTIVITY,
					author: userID,
					date: new Date(),
					description: `has updated the mark of ${student}`
				});
			}
		});
		await entry.save();
	}
}

module.exports = {
	addIssueActivity
}