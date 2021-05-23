const express = require('express');
const router =  express.Router();
const {CourseSession} = require('../../admin/courseSessions/model');
const CourseRegistration = require('../../admin/courseRegistrations/model');
const Course = require('../../admin/courses/model');

const mongoose = require('mongoose');

router.get('/', async (req, res)=> {

	try {
		const ret = await CourseSession
			.find({'teachers.teacher': req.user._id})
			.select('courseID session -_id')
			.populate({
				path: 'courseID',
				select: 'courseID title -_id',
			});
		const currentCourseSessions = ret.filter(courseSession => courseSession.session.getFullYear() === 2021);
		const previousCourseSessions = ret.filter(courseSession => courseSession.session.getFullYear() !== 2021);

		res.status(200).json({currentCourseSessions, previousCourseSessions});
	} catch (error) {
		res.status(400).send({
			error: error.message
		});
	}
});

router.get('/:courseID/:session', async (req, res) => {

	try {
		let _ids = await CourseSession
			.find({
				session: { $gte: new Date(req.params.session), $lt:  new Date(req.params.session +1) }
			})
			.populate({
				path: 'courseID',
				select: 'courseID',
				match: {
					courseID: req.params.courseID
				}
			})
			.select('session registrationList');

	 	_ids = _ids.filter(_id => _id.courseID );

		 if(_ids.length === 0) {
			 res.status(200).json(_ids);
			 return;
		 }

		let ret = await CourseRegistration
			.find(  {'_id': { $in: _ids[0].registrationList}} )
			.select('student attendanceMarks evalMarks -_id');

		res.status(200).json(ret);

	} catch (error) {
		res.status(400).send({
			error: error.message
		});
	}
});


router.post('/addCourseRegistration', async (req, res) => {

	try {
		const courseRegistration = new CourseRegistration({
			courseSession: '60a63ba3376413350d428b9d',
			student: 's4',
			attendanceMarks: [
				{
					teacher: 't3',
					mark: 30
				},
				{
					teacher: 't2',
					mark: 21
				}
			],
			evalMarks: [
				{
					teacher: 't3',
					mark: 19,
					evalID: 1
				},
				{
					teacher: 't3',
					mark: 10,
					evalID: 2
				},
				{
					teacher: 't2',
					mark: 15,
					evalID: 1
				},
				{
					teacher: 't2',
					mark: 8,
					evalID: 2
				}
			],
		});

		await courseRegistration.save();
		res.status(201).json(courseRegistration);
	} catch (error) {
		res.status(400).send({
			error: error.message
		});
	}


});


router.post('/add', async(req, res) => {

	let _id;

	try {
		_id = await Course.findOne({'courseID': 'CSE201'}, '_id');

	} catch(error) {
		res.status(400).send({
			error: error.message
		});
	}

	const courseSession = new CourseSession({
		courseID: _id,
		session: new Date(),
		perEvalWeight: 20,
		totalEvalCount: 4,
		consideredEvalCount: 3,
		attendanceWeight: 10,
		totalMarks: 300,
		teachers: [
			{
				teacher: 't2',
				evalCount: 2,
				evalDescriptions: [
					{
						evalID: 1,
						totalMarks: 20,
					},
					{
						evalID: 2,
						totalMarks: 20,
					}
				]
			},
			{
				teacher: 't3',
				evalCount: 2,
				evalDescriptions: [
					{
						evalID: 1,
						totalMarks: 20,
					},
					{
						evalID: 2,
						totalMarks: 20,
					}
				]
			}
		]
	});

	try {
		await courseSession.save();

		const ret = await CourseSession
			.findOne({_id: courseSession._id})
			.populate({
				path: 'teachers',
				populate: 'teacher'
			})
			.populate('courseID');

		res.status(201).json(ret);
	} catch (error) {
		res.status(400).send({
			error: error.message
		});
	}
});



module.exports = router;
