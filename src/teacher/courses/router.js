const express = require('express');
const router =  express.Router();
const {CourseSession} = require('../../admin/courseSessions/model');
const Course = require('../../admin/courses/model');
const mongoose = require('mongoose');

router.get('/', async(req, res)=> {

	try {
		const ret = await CourseSession
			.find({'teachers.teacher': req.user._id})
			.populate({
				path: 'courseID',
				select: 'courseID title'
			})
			.select('courseID session');

		res.status(201).json(ret);
	} catch (error) {
		res.status(400).send({
			error: error.message
		});
	}

});


router.post('/add', async(req, res) => {

	let _id;

	try {
		_id = await Course.findOne({'courseID': 'CSE109'}, '_id');

	} catch(error) {
		console.log(error);
		res.status(400).send({
			error: error.message
		})
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
