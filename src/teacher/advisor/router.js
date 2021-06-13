const express = require('express');

const { Student } = require('../../admin/accounts/model');
const { CourseRegistration } = require('../../admin/courseRegistrations/model');

const router =  express.Router();

router.get('/advisees', async (req, res) => {
    try {
        const advisees = await Student
            .find({
                'advisor': req.user._id
            })
            .select('_id');

        res.status(200).send(advisees);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.get('/advisees/:id', async (req, res) => {
    try {
        const advisee = await Student
            .findById({
                _id: req.params.id
            })
            .select('_id name email contactNumber residentialAddress department hall level term totalCreditHoursCompleted cgpa');

        res.status(200).send(advisee);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.get('/registrations', async (req, res) => {
    try {
        const advisees = await Student
            .find({
                'advisor': req.user._id
            })
            .select('_id name department level term status');

        res.status(200).send(advisees);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.get('/registrations/:id', async (req, res) => {
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

router.patch('/registrations/:id/approve', async (req, res) => {
    try {
        /* advisee.status: applied -> waiting */
        const updatedAdvisee = await Student
            .updateOne({
                    _id: req.params.id
                },
                {
                    $set: {
                        status: 'waiting'
                    }
                });

        res.status(201).send(updatedAdvisee);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.patch('/registrations/:id/reject', async (req, res) => {
    try {
        /* advisee.status: applied -> unregistered */
        const updatedAdvisee = await Student
            .updateOne({
                    _id: req.params.id
                },
                {
                    $set: {
                        status: 'unregistered'
                    }
                });

        res.status(201).send(updatedAdvisee);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

module.exports = router;
