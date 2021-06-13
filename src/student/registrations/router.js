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
        /* courseRegistration.status: offered -> applied (application) */
        const courseRegistration = await CourseRegistration
            .findById({
                _id: req.body._id
            });
        courseRegistration.status = 'applied';

        await courseRegistration.save();
        res.status(201).send(courseRegistration);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.patch('/course_offered', async (req, res) => {
    try {
        /* courseRegistration.status: applied -> offered (rejection) */
        const courseRegistration = await CourseRegistration
            .findById({
                _id: req.body._id
            });
        courseRegistration.status = 'offered';

        await courseRegistration.save();
        res.status(201).send(courseRegistration);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

module.exports = router;
