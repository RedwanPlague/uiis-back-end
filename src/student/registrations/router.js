const express = require('express');

const { Student } = require('../../admin/accounts/model');
const { CourseRegistration } = require('../../admin/courseRegistrations/model');

const router =  express.Router();

router.get('/:id', async (req, res) => {
    try {
        const courseRegistrations = await CourseRegistration
            .find({
                'student': req.params.id,
                'level': req.query.level,
                'term': req.query.term
            })
            .select('status')
            .populate({
                path: 'courseSession',
                select: 'course',
                populate: {
                    path: 'course',
                    select: 'courseID syllabusID title credit'
                }
            });

        res.status(200).send(courseRegistrations);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.patch('/status_applied', async (req, res) => {
    try {
        /* student.status: unregistered -> applied */
        const updatedStudent = await Student
            .updateOne({
                    _id: req.user._id
                },
                {
                    $set: {
                        status: 'applied'
                    }
                });

        res.status(201).send(updatedStudent);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.patch('/course_applied', async (req, res) => {
    try {
        /* courseRegistration.status: offered -> applied (application by student) */
        const updatedCourseRegistrations = await CourseRegistration
            .updateMany({
                    _id: {
                        '$in': req.body._id
                    }
                },
                {
                    $set: {
                        status: 'applied'
                    }
                });

        res.status(201).send(updatedCourseRegistrations);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.patch('/course_offered', async (req, res) => {
    try {
        /* courseRegistration.status: applied -> offered (rejection by advisor) */
        const updatedCourseRegistrations = await CourseRegistration
            .updateMany({
                    _id: {
                        '$in': req.body._id
                    }
                },
                {
                    $set: {
                        status: 'offered'
                    }
                });

        res.status(201).send(updatedCourseRegistrations);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.patch('/course_registered', async (req, res) => {
    try {
        /* courseRegistration.status: applied -> registered (approval by head) */
        const updatedCourseRegistrations = await CourseRegistration
            .updateMany({
                    student: {
                        '$in': req.body._id
                    },
                    status: 'applied'
                },
                {
                    $set: {
                        status: 'registered'
                    }
                });

        res.status(201).send(updatedCourseRegistrations);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.patch('/course_passed', async (req, res) => {
    try {
        /* courseRegistration.status: registered -> passed (result publication) */
        const updatedCourseRegistrations = await CourseRegistration
            .updateMany({
                    _id: {
                        '$in': req.body._id
                    }
                },
                {
                    $set: {
                        status: 'passed'
                    }
                });

        res.status(201).send(updatedCourseRegistrations);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.patch('/course_failed', async (req, res) => {
    try {
        /* courseRegistration.status: registered -> failed (result publication) */
        const updatedCourseRegistrations = await CourseRegistration
            .updateMany({
                    _id: {
                        '$in': req.body._id
                    }
                },
                {
                    $set: {
                        status: 'failed'
                    }
                });

        res.status(201).send(updatedCourseRegistrations);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

module.exports = router;
