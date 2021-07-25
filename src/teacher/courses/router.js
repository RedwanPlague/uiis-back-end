const express = require('express');
const router =  express.Router();
const {CourseSession} = require('../../admin/courseSessions/model');
const {CourseRegistration} = require('../../admin/courseRegistrations/model');
const {changeResultState, getCourseSession, publishResult} = require('../teacher-common/resultStatusUtil');
const constants = require('../../utils/constants');
const {addMarkUpdateActivity} = require("../issues/service");
const CurrentSession = require("../../admin/currentSessions/model");

router.get('/', async (req, res)=> {

	try {
		const ret = await CourseSession
			.find({'teachers.teacher': req.user._id})
			.lean()
			.select('course session -_id')
			.populate({
				path: 'course',
				select: 'courseID title -_id',
			});

		ret.forEach(courseSession => {
			courseSession.courseID = courseSession.course.courseID;
			courseSession.title = courseSession.course.title;
			delete courseSession.course;
		});
		const currentSession = await CurrentSession
			.findOne()
			.select("session -_id");

		const currentCourseSessions = ret.filter(courseSession => Number(courseSession.session) === Number(currentSession.session) );
		const previousCourseSessions = ret.filter(courseSession => Number(courseSession.session) !== Number(currentSession.session) );

		res.status(200).json({currentCourseSessions, previousCourseSessions});
	} catch (error) {
		res.status(400).send({
			error: error.message
		});
	}
});


router.get('/:courseID/:session', async (req, res) => {

	try {
		req.params.session =  new Date(`${req.params.session} UTC`);
		const courseSession = await getCourseSession(req.params.courseID, req.params.session);

		if(!courseSession) {
			res.status(400).json("");
			return;
		}

		let teacher_details = courseSession.teachers.find(entry => entry.teacher === req.user._id );

		if(!teacher_details) {
			res.status(400).json("");
			return;
		}

		teacher_details = teacher_details.toObject();

		const student_details = await CourseRegistration
			.find(  {'_id': { $in: courseSession.registrationList}} )
			.lean()
			.populate({
				path: 'student',
				select: 'name'
			})
			.select('student attendanceMarks evalMarks -_id');

		student_details.forEach( entry => {
			if(entry.evalMarks) entry.evalMarks = entry.evalMarks.filter(teachers => teachers.teacher === req.user._id);
			if(entry.attendanceMarks) entry.attendanceMarks = entry.attendanceMarks.filter(teachers => teachers.teacher === req.user._id);
			entry.student_name = entry.student.name;
			entry.student_id = entry.student._id;
			delete entry.student;
		});
		teacher_details.session = req.params.session;
		teacher_details.courseID = req.params.courseID;
		teacher_details.courseName = courseSession.course.title;


		res.status(200).json({
			teacher_details,
			student_details
		});

	} catch (error) {
		res.status(400).send({
			error: error.message
		});
	}
});

router.patch('/:courseID/:session', async (req, res) => {
	try {
		req.params.session =  new Date(`${req.params.session} UTC`);
		const courseSession = await getCourseSession(req.params.courseID, req.params.session);
		if(!courseSession) {
			res.status(400).json("");
			return;
		}
		const student_data = req.body.student_data;
		const course_data = req.body.course_data;

		let issueActivity = false;
		let issuePosts = [];

		courseSession.teachers.forEach(entry=> {
			if(entry.teacher === req.user._id) {
				issueActivity |= entry.hasForwarded;
				entry.classCount = course_data.classCount;
				entry.hasForwarded = course_data.hasForwarded;
			}
		});

		await courseSession.save();

		for(const student_entry of student_data) {
			const courseReg = await CourseRegistration
				.findOne({courseSession: courseSession._id , student: student_entry.student_id });

			let added = false;
			courseReg.attendanceMarks.forEach(attendance_entry => {
				if( attendance_entry.teacher === req.user._id) {

					if(attendance_entry.mark !== student_entry.attendance_mark) {
						issuePosts.push(student_entry.student_id)
					}
					attendance_entry.mark = student_entry.attendance_mark
					added = true;
				}
			});
			if(!added) courseReg.attendanceMarks.push({
				teacher: req.user._id,
				mark: student_entry.attendance_mark
			});

			student_entry.evalMarks.forEach(eval_entry=> {

				let added = false;
				courseReg.evalMarks.forEach(course_reg_entry => {
					if( course_reg_entry.teacher === req.user._id && eval_entry.evalID === course_reg_entry.evalID) {
						if(eval_entry.mark !== course_reg_entry.mark) {
							issuePosts.push(student_entry.student_id)
						}
						course_reg_entry.mark = eval_entry.mark;
						course_reg_entry.editAccess = eval_entry.editAccess;
						added = true;
					}
				});
				if(!added) courseReg.evalMarks.push({
					teacher: req.user._id,
					mark: eval_entry.mark,
					evalID: eval_entry.evalID

				})
			});
			await courseReg.save();
		}
		res.status(200).json({
			message: "updated"
		});

		if(issueActivity && issuePosts) {
			issuePosts = [ ...new Set(issuePosts)];
			await addMarkUpdateActivity(issuePosts, req.user._id, constants.ISSUE_EVAL_TYPE.COURSE_EVAL, constants.TF_PARTS.NONE, courseSession);
		}
		await changeResultState(req.params.courseID, req.params.session, constants.RESULT_STATUS.EXAMINER);

	} catch (error) {
		console.log(error.message);
		res.status(400).send({
			error: error.message
		});
	}

});

router.put('/:courseID/:session/reset', async (req, res) => {

	try {
		req.params.session =  new Date(`${req.params.session} UTC`);
		const courseSession = await getCourseSession(req.params.courseID, req.params.session);
		if (!courseSession) {
			res.status(400).json("");
			return;
		}
		courseSession['teachers'].forEach(teacher => teacher.hasForwarded = false);
		Object.values(constants.RESULT_STATUS).forEach(role => {
			if(courseSession[role]) {
				if (Array.isArray(courseSession[role])) {
					courseSession[role].forEach(teacher => {
						teacher.hasForwarded = false;

					});
				} else courseSession[role].hasForwarded = false;
			}
		});
		courseSession.status = constants.RESULT_STATUS.EXAMINER;
		courseSession.headForwarded = false;

		for(let i = 0 ; i < courseSession.registrationList.length ; i++) {
			const courseRegistration = await CourseRegistration.findOne(courseSession.registrationList[i]);
			courseRegistration.evalMarks.forEach(entry => entry.editAccess = true);
			courseRegistration.termFinalMarks.forEach(entry => entry.editAccess = true);
			await courseRegistration.save();

			// for testing if this really works
			// const tmp = await CourseRegistration.findOne(courseSession.registrationList[i]);
			// console.log(tmp.evalMarks[0].editAccess);
			// console.log(tmp.termFinalMarks[0].editAccess);
		}

		await courseSession.save();

		res.status(200).json({
			courseSession
		});

	} catch (error) {
		console.log(error.message);
		res.status(400).send({
			error: error.message
		});
	}
});

router.put('/:courseID/:session/:role/set', async (req, res) => {

	try {
		req.params.session =  new Date(`${req.params.session} UTC`);
		const courseSession = await getCourseSession(req.params.courseID, req.params.session);
		if (!courseSession || !courseSession[req.params.role]) {
			res.status(400).json("");
			return;
		}

		if(Array.isArray(courseSession[req.params.role]) ) {
			courseSession[req.params.role].forEach(teacher => teacher.hasForwarded = true);
		}
		else {
			courseSession[req.params.role].hasForwarded = true;
		}
		await courseSession.save();

		if(req.params.role === constants.RESULT_STATUS.EXAMINER || req.params.role === 'teachers') {

			for (let i = 0; i < courseSession.registrationList.length; i++) {
				const courseRegistration = await CourseRegistration.findOne(courseSession.registrationList[i]);

				if(req.params.role === constants.RESULT_STATUS.EXAMINER) {
					courseRegistration.termFinalMarks.forEach(entry => entry.editAccess = false);
				}
				if(req.params.role === 'teachers') {
					courseRegistration.evalMarks.forEach(entry => entry.editAccess = false);
				}
				await courseRegistration.save();

				// for testing if this really works
				// const tmp = await CourseRegistration.findOne(courseSession.registrationList[i]);
				// console.log(tmp.evalMarks[0].editAccess);
				// console.log(tmp.termFinalMarks[0].editAccess);
			}
		}


		await changeResultState(req.params.courseID, req.params.session, req.params.role);

		const newCourseSession = await getCourseSession(req.params.courseID, req.params.session);

		res.status(200).json({
			newCourseSession
		});

	} catch (error) {
		console.log(error.message);
		res.status(400).send({
			error: error.message
		});
	}
});

router.put('/revertResult', async (req, res) => {

	try {
		const courseRegs = await CourseRegistration.find();

		for(const entry of courseRegs) {
			entry.result = null;
			entry.status = constants.COURSE_REGISTRATION_STATUS.REGISTERED;
			await entry.save();
		}
		const currentSession = await CurrentSession.findOne();
		currentSession.resultPublished = false;
		await currentSession.save();

		res.status(200).json(courseRegs);

	} catch (error) {
		console.log(error.message);
		res.status(400).send({
			error: error.message
		});
	}
});

router.put('/publishResult', async(req, res) => {
	try {
		await publishResult();
		res.status(200).json({msg:"ok"});
	} catch(error) {
		console.log(error.message);
		res.status(400).send({
			error: error.message
		});
	}

});


module.exports = router;
