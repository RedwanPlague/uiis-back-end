const express = require('express');

const { CourseRegistration } = require('../../admin/courseRegistrations/model');

const router =  express.Router();

/* backend api calls: main */
router.get('/:id', async (req, res) => {
    try {
        let grades = [];

        if(req.query.filter === 'semester') {
            grades = await CourseRegistration
                .find({
                    'student': req.params.id,
                    'level': req.query.level,
                    'term': req.query.term
                })
                .select('level term result.gradePoint result.gradeLetter status')
                .populate({
                    path: 'courseSession',
                    select: 'course',
                    populate: {
                        path: 'course',
                        select: 'courseID title credit'
                    }
                });
        } else if(req.query.filter === 'grade') {
            grades = await CourseRegistration
                .find({
                    'student': req.params.id,
                    'result.gradeLetter': req.query.gradeLetter
                })
                .select('level term result.gradePoint result.gradeLetter status')
                .populate({
                    path: 'courseSession',
                    select: 'course',
                    populate: {
                        path: 'course',
                        select: 'courseID title credit'
                    }
                });
        }
        res.status(200).send(grades);
    } catch(error) {
        res.status(400).send({
            error: error.message
        });
    }
});

module.exports = router;
