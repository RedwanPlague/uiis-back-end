const express = require('express');
const router =  express.Router();
const {Issues} = require('./model');
const {getCourseSession} = require('../teacher-common/resultStatusUtil');
const {CourseRegistration} = require('../../admin/courseRegistrations/model');
const {setEditStatus, removeEditAccess} = require('./service');
const constants = require('../../utils/constants');
const {CourseSession} = require("../../admin/courseSessions/model");

router.get('/', async (req, res) => {
	try {
		const issues = await Issues
			.find({teachers: req.user._id})
			.lean()
			.select('issueCreator title evalType part status')
			.populate({
				path: 'courseSession',
				select: 'course -_id',
				populate: {
					path: 'course',
					select: 'courseID title -_id'
				}
			})
			.populate({
				path:'issueCreator',
				select:'name'
			})
			.populate({
				path:'teachers',
				select:'name'
			});
		issues.forEach(issue => {
			issue.courseID = issue.courseSession.course.courseID;
			issue.courseTitle = issue.courseSession.course.title;
			issue.issueCreator = {id: issue.issueCreator._id, name: issue.issueCreator.name};
			delete issue.courseSession;
			const teacherList = [];
			issue.teachers.forEach(teacher => {
				teacherList.push({id: teacher._id, name: teacher.name});
			});
			issue.teachers = teacherList;
		});

		const unresolvedIssues = issues.filter(issue => issue.status === constants.ISSUE_STATUS.UNRESOLVED);
		const resolvedIssues = issues.filter(issue => issue.status === constants.ISSUE_STATUS.RESOLVED);

		res.status(200).json({unresolvedIssues, resolvedIssues});

	} catch (error) {
		console.log(error);
		res.status(400).json({
			msg: error
		});
	}
});

router.get('/:id', async (req, res) => {
	try {
		let issue = await Issues
			.findOne({_id: req.params.id})
			.populate({
				path: 'teachers',
				select: 'name'
			})
			.populate({
				path: 'issueCreator',
				select: 'name'
			})
			.populate({
				path: 'evalOwner',
				select: 'name'
			})
			.populate({
				path: 'courseSession',
				select: 'teachers examiners scrutinizers internals -_id',
				populate: {
					path: 'course',
					select: 'courseID title -_id'
				}
			})
			.populate({
				path:'posts.author',
				select: 'name'
			});

		if(!issue) {
			res.status(400).json('');
			return;
		}
		issue = issue.toObject();

		if(req.user._id === issue.evalOwner._id) {
			if(issue.part === '-') issue.role = 'course'
			else issue.role = 'examiner';
		}
		else if(issue.courseSession.scrutinizers.filter(scrutinizer => scrutinizer.teacher === req.user._id).length > 0) {
			issue.role = 'scrutinizer';
		}
		else if(issue.courseSession.internals.filter(internal => internal.teacher === req.user._id).length > 0) {
			issue.role = 'internal';
		}
		else issue.role = 'none';

		res.status(200).json(issue);
	} catch (error) {
		console.log(error);
		res.status(400).json({
			msg: error
		});
	}
});

router.post('/create', async (req, res) => {
	try {
		const courseSession = await getCourseSession(req.body.courseID, '2021');
		const issue = new Issues({
			evalType: req.body.evalType,
			part: req.body.part,
			evalOwner: req.body.evalOwner,
			title: req.body.title,
			courseSession: courseSession._id,
			allStudentSelected: req.body.allStudentSelected,
			students: req.body.students,
			teachers: req.body.teachers,
			issueCreator: req.user._id,
			posts: [
				{
					postType: constants.ISSUE_POST_TYPE.ACTIVITY,
					author: req.user._id,
					date: Date.now(),
					description: "created this issue"
				}
			]
		});
		if(req.body.description) {
			issue.posts.push({
				postType: constants.ISSUE_POST_TYPE.COMMENT,
				author: req.user._id,
				date: Date.now(),
				description: req.body.description
			});
		}
		await issue.save();

		await setEditStatus(courseSession, req.body.students, req.body.evalType, req.body.part, req.body.evalOwner, true);
		res.status(201).json(issue);

	} catch (error) {
		console.log(error);
		res.status(400).json({
			msg: error
		});
	}
});

// add image link
router.post('/:id/posts/create/', async(req, res) => {
	try {
		const issue = await Issues.findOne({_id: req.params.id});
		if(!issue) throw('No issue found');

		issue.posts.push({
			postType: constants.ISSUE_POST_TYPE.COMMENT,
			author: req.user._id,
			date: new Date(),
			description: req.body.comment
		});
		await issue.save();

		await issue.populate( { path: 'posts.author', select: 'name'}).execPopulate();

		res.status(201).json(issue.posts);
	} catch (error) {
		res.status(400).json({
			msg: error
		});
	}
});

router.put('/:issueID/changeStatus', async (req, res) => {
	try {
		const issue = await Issues.findOne({_id: req.params.issueID });
		if(!issue) throw('No issue found');
		if(issue.status === constants.ISSUE_STATUS.UNRESOLVED) {
			issue.status = constants.ISSUE_STATUS.RESOLVED;
		}
		else {
			issue.status = constants.ISSUE_STATUS.UNRESOLVED;
		}
		issue.posts.push({
			postType: constants.ISSUE_POST_TYPE.ACTIVITY,
			author: req.user._id,
			date: new Date(),
			description: `${issue.status === constants.ISSUE_STATUS.RESOLVED ? 'closed': 'reopened'} this issue`

		})
		await issue.save();
		await issue.populate( { path: 'posts.author', select: 'name'}).execPopulate();

		const courseSession = await CourseSession
			.findOne({_id: issue.courseSession})
			.select('registrationList');

		if(issue.status === constants.ISSUE_STATUS.UNRESOLVED) {
			await setEditStatus(courseSession, issue.students, issue.evalType, issue.part, issue.evalOwner, true);
		}
		else {
			await removeEditAccess(courseSession, issue.students, issue.evalType, issue.part, issue.evalOwner);
		}

		res.status(200).json({
			status: issue.status,
			posts: issue.posts
		});
	} catch (error) {
		res.status(400).json({
			msg: error
		});
	}
});



router.get('/:courseID/:session/eligibleList', async (req, res) => {

	try {
		const courseSession = await getCourseSession(req.params.courseID, req.params.session);
		const statuses = Object.values(constants.RESULT_STATUS);
		const till = statuses.indexOf(courseSession.status);
		let list = [];

		for(let i = 1 ; i <= till ; i++) {
			await courseSession.populate({path: `${statuses[i]}.teacher`, select:'name'}).execPopulate();

			if(statuses[i] === constants.RESULT_STATUS.DEPARTMENT_HEAD) {
				list.push({
					userType: req.user.userType,
					_id: req.user._id,
					name: req.user.name
				})
			}
			else if( Array.isArray(courseSession[statuses[i]]) ) {
				courseSession[statuses[i]].forEach(entry => {
					list.push(entry.teacher.toObject());
				});
			}
			else {
				list.push(courseSession[statuses[i]].toObject());
			}
		}

		let teacher_ids = [], return_list = [];

		list.forEach(teacher=> {
			if(!teacher_ids[teacher._id]) {
				teacher.id = teacher._id;
				return_list.push(teacher);

			}
			teacher_ids[teacher._id] = 1;
		});

		list = return_list;

		res.status(200).json(list);

	} catch (error) {
		console.log(error);
		res.status(400).json({
			msg: error
		});
	}
});

router.put('/empty', async (req, res) => {
	try {
		await Issues.deleteMany();
		res.status(200).send({"message": "you don't have any issues left :'("});

	} catch (error) {
		res.status(400).json({
			msg: error
		});
	}
});


// router.post('/',async (req, res) => {
//
// 	try {
// 		const courseSession = await getCourseSession('CSE203', '2021');
// 		if(!courseSession) throw new Error('No course found');
// 		const issue = new Issues({
// 			_id: 4,
// 			evalType: 'Course',
//
// 			evalOwner: 't2',
// 			title: 'Marks Discrepancy',
// 			courseSession: courseSession._id,
// 			status: constants.ISSUE_STATUS.RESOLVED,
// 			students: ['1605007' , '1605008'],
// 			teachers: ['t2', 't3'],
// 			creator: 't3',
// 			posts: [
// 				{
// 					postType: 'Comment',
// 					author: 't3',
// 					description: 'Marks empty',
// 					imageLink: 'https://avatars.githubusercontent.com/u/32516061?s=80&amp;v=4'
// 				}
// 			]
// 		});
// 		await issue.save();
// 		res.status(201).json(
// 			issue
// 		);
// 	} catch (error) {
// 		console.log(error);
// 		res.status(400).json({
// 			msg: error
// 		});
// 	}
// });

module.exports = router;