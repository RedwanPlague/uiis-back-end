const express = require('express')

const Course = require('../courses/model')
const {CourseSession} = require('./model')
const router = new express.Router()


router.post('/create', async (req,res) => {

    try {
        const course = await Course.findOne({
            courseID: req.body.courseID,
            syllabusID: req.body.syllabusID
        })
        if(!course){
            throw new Error('This course does not exist')
        } 
        req.body.course = course._id
        const courseSession = new CourseSession(req.body)
        await courseSession.save()

        res.status(201).send()
        
    } catch (error) {
        res.status(400).send({
            error: error.message
        })
    }
})


module.exports = router