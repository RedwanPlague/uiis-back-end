const express = require('express');

const { Student } = require('../../admin/accounts/model');

const secondRouter = require("./secondRouter");

const Department = require('../../admin/departments/model');


const router =  express.Router();

router.get('/students', async (req, res) => {
    try {
        const students = await Student
            .find({
                'department': req.user.department,
                $or: [{ 'status': 'waiting' }, { 'status': 'applied' }, {'status': 'unregistered' }]
            })
            .select('_id name level term status')
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

router.get('/department/:department', async (req, res) => {
    try {
        const department = await Department
            .findById({
                _id: req.params.department
            })
            .select('_id head');

        res.status(200).send(department);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.use(secondRouter);

module.exports = router;
