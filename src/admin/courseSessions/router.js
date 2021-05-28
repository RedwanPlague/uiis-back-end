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

router.get('/list', async (req, res) => {
    let match = {}

    if (req.query.session) {
        match.session = req.query.session
    }
   
    try {
        const courseSessions = await CourseSession.find(match)
        res.send(courseSessions)
    } catch (error) {
        res.status(500).send({
            error: error.message
        })
    }
})


router.patch('/update/:courseID/:syllabusID/:session', async (req, res) => {
    const updates = Object.keys(req.body)
    try {

        const course = await Course.findOne({
            courseID: req.params.courseID,
            syllabusID: req.params.syllabusID,
        })
        if(!course){
            throw new Error('This course does not exist')
        } 

        const courseSession = await CourseSession.findOne({
            course: course._id,
            session: req.params.session
        })
        if(!courseSession){
            throw new Error('This course session does not exist')
        } 
        
        updates.forEach((update) => courseSession.set(update, req.body[update]))

        await courseSession.save()

        res.send()

    } catch (error) {
        res.status(400).send({error: error.message})
    }

})

router.patch('/update/:courseID/:syllabusID/:session/teachers', async (req, res) => {
    console.log("dhuksi")
    try {
        const course = await Course.findOne({
            courseID: req.params.courseID,
            syllabusID: req.params.syllabusID,
        })
        if(!course){
            throw new Error('This course does not exist')
        } 

        const courseSession = await CourseSession.findOne({
            course: course._id,
            session: req.params.session
        })
        if(!courseSession){
            throw new Error('This course session does not exist')
        } 

        courseSession.teachers = req.body
    
        await courseSession.save()

        res.send(courseSession)
        
    } catch (error) {
        res.status(400).send({
            error: error.message
        })
    }
})



router.patch('/update/:courseID/:syllabusID/:session/examiners', async (req, res) => {
    try {
        const course = await Course.findOne({
            courseID: req.params.courseID,
            syllabusID: req.params.syllabusID,
        })
        if(!course){
            throw new Error('This course does not exist')
        } 

        const courseSession = await CourseSession.findOne({
            course: course._id,
            session: req.params.session
        })
        if(!courseSession){
            throw new Error('This course session does not exist')
        } 

        courseSession.examiners = req.body
    
        await courseSession.save()

        res.send(courseSession)
        
    } catch (error) {
        res.status(400).send({
            error: error.message
        })
    }
})




router.patch('/update/:courseID/:syllabusID/:session/scrutinizers', async (req, res) => {
    try {
        const course = await Course.findOne({
            courseID: req.params.courseID,
            syllabusID: req.params.syllabusID,
        })
        if(!course){
            throw new Error('This course does not exist')
        } 

        const courseSession = await CourseSession.findOne({
            course: course._id,
            session: req.params.session
        })
        if(!courseSession){
            throw new Error('This course session does not exist')
        } 

        courseSession.scrutinizers = req.body
    
        await courseSession.save()

        res.send(courseSession)
        
    } catch (error) {
        res.status(400).send({
            error: error.message
        })
    }
})



router.patch('/update/:courseID/:syllabusID/:session/resultAccessHolders', async (req, res) => {
    try {
        const course = await Course.findOne({
            courseID: req.params.courseID,
            syllabusID: req.params.syllabusID,
        })
        if(!course){
            throw new Error('This course does not exist')
        } 

        const courseSession = await CourseSession.findOne({
            course: course._id,
            session: req.params.session
        })
        if(!courseSession){
            throw new Error('This course session does not exist')
        } 

        courseSession.resultAccessHolders = req.body
    
        await courseSession.save()

        res.send(courseSession)
        
    } catch (error) {
        res.status(400).send({
            error: error.message
        })
    }
})



router.patch('/update/:courseID/:syllabusID/:session/schedule', async (req, res) => {
    try {
        const course = await Course.findOne({
            courseID: req.params.courseID,
            syllabusID: req.params.syllabusID,
        })
        if(!course){
            throw new Error('This course does not exist')
        } 

        const courseSession = await CourseSession.findOne({
            course: course._id,
            session: req.params.session
        })
        if(!courseSession){
            throw new Error('This course session does not exist')
        } 

        courseSession.schedule = req.body
    
        await courseSession.save()

        res.send(courseSession)
        
    } catch (error) {
        res.status(400).send({
            error: error.message
        })
    }
})




module.exports = router