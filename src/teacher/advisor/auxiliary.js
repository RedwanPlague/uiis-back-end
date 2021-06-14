const express = require('express');

const { Student } = require('../../admin/accounts/model');
const { CourseRegistration } = require('../../admin/courseRegistrations/model');

const router =  express.Router();

router.patch('/update', async (req, res) => {
    try {
        /* updates courseRegistration documents with level/term based on courseSession */
        const updatedCourseRegistrations = await CourseRegistration
            .updateMany({
                    courseSession: '60ace00a85d812012621f796'
                },
                {
                    $set: {
                        level: 2,
                        term: 1
                    }
                });

        res.status(201).send(updatedCourseRegistrations);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

router.patch('/registrations/:id/applied', async (req, res) => {
    try {
        /* advisee.status: unregistered/applied/waiting/registered -> applied */
        const updatedAdvisee = await Student
            .updateOne({
                    _id: req.params.id
                },
                {
                    $set: {
                        status: 'applied'
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
