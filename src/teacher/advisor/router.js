const express = require('express');
const mongoose = require('mongoose');

const { Student } = require('../../admin/accounts/model');

const router =  express.Router();

router.get('/teacher/advisor/advisees', async (req, res) => {
    try {
        const advisees = await Student
            .find({ 'advisor': req.user._id })
            .select('_id name email contactNumber residentialAddress department hall level term');
        res.status(200).json(advisees);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

module.exports = router;
