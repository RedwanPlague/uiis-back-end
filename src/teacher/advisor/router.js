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
        res.status(200).json(advisees);
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
        res.status(200).json(advisee);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.get('/advisees/:id/grades', async (req, res) => {
    try {
        // const grades = await CourseRegistration
        //     .find({
        //         'student': req.params.id
        //     }).select
        res.status(200).json(grades);
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
        res.status(200).json(advisees);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.get('/registrations/:id', async (req, res) => {
    try {
        // const advisees = await Student
        //     .find({
        //         'advisor': req.user._id
        //     })
        //     .select('_id status');
        res.status(200).json(advisees);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.put('/registrations/:id/approve', async (req, res) => {

});

router.put('/registrations/:id/reject', async (req, res) => {

});

module.exports = router;
