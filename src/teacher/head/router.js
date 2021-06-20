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
            .select('_id name level term')
            .populate({
                path: 'advisor',
                select: '_id name'
            });

        res.status(200).send(students);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.patch('/registrations/approve', async (req, res) => {
    try {
        /* student.status: waiting -> registered */
        const updatedStudents = await Student
            .updateMany({
                    _id: {
                        '$in': req.body._id
                    }
                },
                {
                    $set: {
                        status: 'registered'
                    }
                });

        res.status(201).send(updatedStudents);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.patch('/registrations/reject', async (req, res) => {
    try {
        /* student.status: waiting -> applied */
        const updatedStudents = await Student
            .updateMany({
                    _id: {
                        '$in': req.body._id
                    }
                },
                {
                    $set: {
                        status: 'applied'
                    }
                });

        res.status(201).send(updatedStudents);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

module.exports = router;
