const mongoose = require('mongoose');
const constants = require('../../utils/constants');

const issueSchema = new mongoose.Schema({

	evalType: {
		type: String,
		enum: Object.values(constants.ISSUE_EVAL_TYPE),
		required: true
	},
	part: {
		type: String,
		enum: Object.values(constants.TF_PARTS),
		default: constants.TF_PARTS.NONE
	},
	evalOwner: {
		type: String,
		ref: 'User',
		required: true
	},
	title: {
		type: String,
		required: true,
	},
	courseSession: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'CourseSession',
		required: true
	},
	status: {
		type: String,
		enum: Object.values(constants.ISSUE_STATUS),
		default: constants.ISSUE_STATUS.UNRESOLVED
	},
	allStudentsSelected: {
		type: Boolean,
		default: false
	},
	students: [
		{
			type: String
		}
	],
	teachers: [
		{
			type: String,
			required: true,
			ref: 'User',
		}
	],
	issueCreator: {
		type: String,
		ref: 'User',
		required: true,
	},
	posts: [
		{
			postType: {
				type: String,
				enum: Object.values(constants.ISSUE_POST_TYPE),
				required: true
			},
			author: {
				type: String,
				ref: 'User',
				required: true
			},
			date: Date,
			description: String,
			imageLink: String
		}
	]
});

const Issues = mongoose.model('Issues', issueSchema);
module.exports = {
	Issues
}