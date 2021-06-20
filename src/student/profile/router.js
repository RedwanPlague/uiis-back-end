const express = require('express');

const { Student } = require('../../admin/accounts/model');

const router =  express.Router();

router.get('/id', async (req, res) => {
    res.status(200).send({
        id: req.user._id
    });
});

router.get('/profile/:id', async (req, res) => {
    try {
        const student = await Student
            .findById({
                _id: req.params.id
            })
            .select('_id name level term department hall contactNumber email residentialAddress status');

        res.status(200).send(student);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

module.exports = router;
