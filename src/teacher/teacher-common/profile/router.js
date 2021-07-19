const express = require('express');

const { Teacher } = require('../../../admin/accounts/model');
const { CourseSession } = require('../../../admin/courseSessions/model');

const router = express.Router();

router.get('/profile', async (req, res) => {
    try {
        const teacher = await Teacher
            .findById({
                _id: req.user._id
            })
            .select('_id name contactNumber email residentialAddress department');

        res.status(200).send(teacher);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.patch('/profile/edit', async (req, res) => {
    try {
        const updatedTeacher = await Teacher
            .updateOne({
                    _id: req.user._id
                },
                {
                    $set: {
                        contactNumber: req.body.contactNumber,
                        email: req.body.email,
                        residentialAddress: req.body.residentialAddress
                    }
                });

        res.status(201).send(updatedTeacher);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.get('/routine', async (req, res) => {
    try {
        const currentCourseSessions = await CourseSession
            .find({
                'session': req.query.session,
                'teachers.teacher': req.user._id
            })
            .select('schedule teachers.teacher')
            .populate({
                path: 'course',
                select: 'courseID'
            });

        res.status(200).send(currentCourseSessions);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

module.exports = router;
