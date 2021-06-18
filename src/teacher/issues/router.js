const express = require('express');
const router =  express.Router();
const {Issues} = require('./model');
const {getCourseSession} = require('../teacher-common/resultStatusUtil');
const {CourseRegistration} = require('../../admin/courseRegistrations/model');
const constants = require('../../utils/constants');

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
			})
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
		const issue = await Issues
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
				select: 'course -_id',
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
					date: req.body.date,
					description: "created this issue"
				}
			]
		});
		if(req.body.description) {
			issue.posts.push({
				postType: constants.ISSUE_POST_TYPE.COMMENT,
				author: req.user._id,
				date: req.body.date,
				description: req.body.description
			});
		}

		const courseRegistrations = await CourseRegistration
			.find(  {'_id': { $in: courseSession.registrationList} , 'student': { $in: req.body.students} } );

		for(let i = 0 ; i < courseRegistrations.length ; i++) {
			const entry = courseRegistrations[i];

			if(req.body.evalType === constants.ISSUE_EVAL_TYPE.COURSE_EVAL) {

				const eval = entry.evalMarks.find(entry => entry.teacher === req.body.evalOwner);
				const id = entry.evalMarks.indexOf(eval);
				entry.evalMarks[id].editAccess  = true;
			}
			else if(req.body.evalType === constants.ISSUE_EVAL_TYPE.TF_EVAL) {

				const eval = entry.termFinalMarks.find(entry => entry.examiner === req.body.evalOwner);
				const id = entry.termFinalMarks.indexOf(eval);
				entry.termFinalMarks[id].editAccess  = true;
			}
			await entry.save();
		}

		await issue.save();

		// for testing
		// const tmp = await CourseRegistration
		// 	.find(  {'_id': { $in: courseSession.registrationList} , 'student': { $in: req.body.students} } );
		// console.log("---------------");
		//
		// tmp.forEach( entry => {
		// 	console.log(entry.student)
		// 	console.log(entry.evalMarks);
		// });

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