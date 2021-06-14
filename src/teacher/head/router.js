const express = require('express');

const { Student } = require('../../admin/accounts/model');

const router =  express.Router();

router.get('/students', async (req, res) => {
    try {
        const students = await Student
            .find({
                'department': req.user.department,
                'status': 'waiting'
            })
            .select('_id name level term');

        res.status(200).send(students);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.patch('/registrations/:id/approve', async (req, res) => {
    try {
        /* student.status: waiting -> registered */
        const updatedStudent = await Student
            .updateOne({
                    _id: req.params.id
                },
                {
                    $set: {
                        status: 'registered'
                    }
                });

        res.status(201).send(updatedStudent);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.patch('/registrations/:id/reject', async (req, res) => {
    try {
        /* student.status: waiting -> applied */
        const updatedStudent = await Student
            .updateOne({
                    _id: req.params.id
                },
                {
                    $set: {
                        status: 'applied'
                    }
                });

        res.status(201).send(updatedStudent);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

module.exports = router;
