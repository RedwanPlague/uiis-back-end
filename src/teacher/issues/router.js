const express = require('express');
const router =  express.Router();
const {Issues} = require('./model');
const {getCourseSession} = require('../teacher-common/resultStatusUtil');
const {CourseRegistration} = require('../../admin/courseRegistrations/model');
const {setEditStatus, removeEditAccess} = require('./service');
const constants = require('../../utils/constants');
const {CourseSession} = require("../../admin/courseSessions/model");
const Department = require("../../admin/departments/model");
const CurrentSession = require("../../admin/currentSessions/model");

router.get('/', async (req, res) => {
	try {
		let issues = await Issues
			.find({teachers: req.user._id})
			.lean()
			.select('issueCreator title evalType part status')
			.populate({
				path: 'courseSession',
				select: 'course -_id session',
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
		const currentSession = await CurrentSession.findOne();

		issues = issues.filter(issue => issue.courseSession.session.getTime() === currentSession.session.getTime() )

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
				select: 'teachers examiners scrutinizers internals -_id session',
				populate: {
					path: 'course',
					select: 'courseID title -_id'
				}
			})
			.populate({
				path:'posts.author',
				select: 'name display_image_link'
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
		else {
			const currentSession = await CurrentSession.findOne();
			if(currentSession.eco === req.user._id) issue.role = 'eco';
			else issue.role = 'head';
		}

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
		const currenSession = await CurrentSession.findOne();
		const courseSession = await getCourseSession(req.body.courseID, currenSession.session);
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

		await issue.populate( { path: 'posts.author', select: 'name display_image_link'}).execPopulate();

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
		await issue.populate( { path: 'posts.author', select: 'name display_image_link'}).execPopulate();

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
		req.params.session =  new Date(`${req.params.session}`);
		const courseSession = await getCourseSession(req.params.courseID, req.params.session);
		const statuses = Object.values(constants.RESULT_STATUS);
		const till = statuses.indexOf(courseSession.status);
		let list = [];


		for(let i = 1 ; i <= Math.min(till, 2) ; i++) {
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

		// console.log(courseSession);

		if(till >= 3) {
			const dept_head = await Department
				.findOne({id: courseSession.course.offeredByDepartment})
				.select("-_id head")
				.populate({
					path: 'head',
					select: 'name'
				});
			list.push(dept_head.head.toObject());
		}
		if(till >= 4) {
			const eco = await CurrentSession
				.findOne()
				.select('eco -_id')
				.populate({
					path: 'eco',
					select: 'name'
				})
			list.push(eco.eco.toObject());
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


module.exports = router;