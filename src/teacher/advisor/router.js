const express = require('express');
const mongoose = require('mongoose');

const { Student } = require('../../admin/accounts/model');

const router =  express.Router();

router.get('/teacher/advisor/advisees', async (req, res) => {
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

router.get('/teacher/advisor/advisees/:id', async (req, res) => {
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

router.get('/teacher/advisor/advisees/:id/grades', async (req, res) => {
    try {

    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.get('/teacher/advisor/registrations', async (req, res) => {
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

router.get('/teacher/advisor/registrations/:id', async (req, res) => {
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

module.exports = router;
