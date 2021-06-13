const express = require('express');

const { Student } = require('../../admin/accounts/model');
const { CourseRegistration } = require('../../admin/courseRegistrations/model');

const router =  express.Router();

router.get('', async (req, res) => {
    try {
        const courseRegistrations = await CourseRegistration
            .find({
                'student': req.user._id,
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

        res.status(200).send(updatedStudent);
    } catch(error) {
        res.status(404).send({
            error: error.message
        });
    }
});

module.exports = router;
