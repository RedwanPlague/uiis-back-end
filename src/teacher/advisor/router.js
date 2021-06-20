const express = require('express');

const { Student } = require('../../admin/accounts/model');

const router =  express.Router();

router.get('/advisees', async (req, res) => {
    try {
        const advisees = await Student
            .find({
                'advisor': req.user._id
            })
            .select('_id level term status');

        res.status(200).send(advisees);
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
