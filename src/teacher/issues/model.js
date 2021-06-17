const mongoose = require('mongoose');
const constants = require('../../utils/constants');

const issueSchema = new mongoose.Schema({

	_id: {
		type: Number,
		required: true
	},
	evalType: {
		type: String,
		required: true
	},
	part: {
		type: String,
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
	},
	posts: [
		{
			postType: String,
			author: {
				type: String,
				ref: 'User'
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