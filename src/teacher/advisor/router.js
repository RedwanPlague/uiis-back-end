const express = require('express');
const mongoose = require('mongoose');

const { Student } = require('../../admin/accounts/model');
const CourseRegistration = require('../../admin/courseRegistrations/model');

const router =  express.Router();

router.get('/advisees', async (req, res) => {
    try {
        const advisees = await Student
            .find({
                'advisor': req.user._id
            })
            .select('_id');

        res.status(200).send(advisees.toArray());
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
            .select('_id name email contactNumber residentialAddress department hall level term');

        res.status(200).send(advisee);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.get('/advisees/:id/grades', async (req, res) => {
    try {
        const grades = await CourseRegistration
            .find({
                'student': req.params.id,
                'level': req.body.level,
                'term': req.body.term
            })
            .select('level term result status cgpa totalCreditHoursCompleted')
            .populate({
                path: 'courseSession',
                populate: {
                    path: 'course',
                    select: 'courseID title credit'
                }
            });

        res.status(200).send(grades.toArray());
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
            .select('_id status');

        res.status(200).send(advisees.toArray());
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.get('/registrations/:id', async (req, res) => {
    try {
        const courses = await CourseRegistration
            .find({
                'student': req.params.id,
                'level': req.body.level,
                'term': req.body.term
            })
            .select('status')
            .populate({
                path: 'courseSession',
                populate: {
                    path: 'course',
                    select: 'courseID syllabusID title credit'
                }
            });

        res.status(200).send(courses.toArray());
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

        res.status(200).send(updatedAdvisee);
    } catch(error) {
        res.status(404).send({
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

        res.status(200).send(updatedAdvisee);
    } catch(error) {
        res.status(404).send({
            error: error.message
        });
    }
});

module.exports = router;
