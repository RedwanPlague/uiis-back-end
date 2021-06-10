const express = require('express');

const { Student } = require('../../admin/accounts/model');

const router =  express.Router();

router.get('/basic', async (req, res) => {
    try {
        const student = await Student
            .findById({
                _id: req.user._id
            })
            .select('_id name level term department hall');

        res.status(200).send(student);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.get('/details', async (req, res) => {
    try {
        const student = await Student
            .findById({
                _id: req.user._id
            })
            .select('_id name level term department hall contactNumber email residentialAddress');

        res.status(200).send(student);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

module.exports = router;
