const express = require('express')

const Course = require('../courses/model')
const {CourseSession} = require('./model')
const {adminRequired,hasAllPrivileges,hasAnyPrivileges} = require('../../utils/middlewares')
const constants = require('../../utils/constants')
const router = new express.Router()

/**
 * Privilege : COURSE_SESSION_UPDATE
 */
router.post('/create',
    hasAllPrivileges([constants.PRIVILEGES.COURSE_SESSION_UPDATE]),
    async (req,res) => {

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
        res.status(201).send(courseSession)
    } catch (error) {
        res.status(400).send({
            error: error.message
        })
    }
})

/**
 * Privilege :
 COURSE_SESSION_CREATION
 COURSE_SESSION_UPDATE
 COURSE_SESSION_ASSIGN_EXAMINER
 COURSE_SESSION_ASSIGN_TEACHER
 COURSE_SESSION_ALLOT_SCHEDULE
 COURSE_SESSION_ASSIGN_SCRUTINIZER
 COURSE_SESSION_ASSIGN_INTERNAL
 */
router.get('/list',
    hasAnyPrivileges([
        // constants.PRIVILEGES.COURSE_SESSION_CREATION,
        constants.PRIVILEGES.COURSE_SESSION_UPDATE,
        constants.PRIVILEGES.COURSE_SESSION_ASSIGN_EXAMINER,
        constants.PRIVILEGES.COURSE_SESSION_ASSIGN_TEACHER,
        constants.PRIVILEGES.COURSE_SESSION_ALLOT_SCHEDULE,
        constants.PRIVILEGES.COURSE_SESSION_ASSIGN_SCRUTINIZER,
        constants.PRIVILEGES.COURSE_SESSION_ASSIGN_INTERNAL
    ]),async (req, res) => {
    let match = {}
    if (req.query.session) {
        match.session = req.query.session
    }
    try {
        if(req.query.courseID && req.query.syllabusID){
            const course = await Course.findOne({
                courseID: req.query.courseID,
                syllabusID: req.query.syllabusID
            })
            if(!course){
                throw new Error('Invalid course or syllabus ID')
            }
            match.course = course._id
        }
        const courseSessions = await CourseSession.find(match)
        res.send(courseSessions)
    } catch (error) {
        res.status(500).send({
            error: error.message
        })
    }
})
/**
 * Privilege : COURSE_SESSION_UPDATE
 */

router.patch('/update/:courseID/:syllabusID/:session',hasAllPrivileges([constants.PRIVILEGES.COURSE_SESSION_UPDATE]),async (req, res) => {
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

/**
 * Privilege : COURSE_SESSION_ASSIGN_TEACHER
 */
router.patch('/update/:courseID/:syllabusID/:session/teachers',hasAllPrivileges([constants.PRIVILEGES.COURSE_SESSION_ASSIGN_TEACHER]),async (req, res) => {
    try {
        const course = await Course.findOne({
            courseID: req.params.courseID,
            syllabusID: req.params.syllabusID,
        })
        if(!course){
            throw new Error('This course does not exist')
        }
        await CourseSession.updateOne({
            course: course._id,
            session: req.params.session
        },{
            $set: {
                teachers: req.body
            }
        })
        res.send()
    } catch (error) {
        res.status(400).send({
            error: error.message
        })
    }
})

/**
 * Privilege : COURSE_SESSION_ASSIGN_EXAMINER
 */

router.patch('/update/:courseID/:syllabusID/:session/examiners',hasAllPrivileges([constants.PRIVILEGES.COURSE_SESSION_ASSIGN_EXAMINER]),async (req, res) => {
    try {
        const course = await Course.findOne({
            courseID: req.params.courseID,
            syllabusID: req.params.syllabusID,
        })
        if(!course){
            throw new Error('This course does not exist')
        }
        await CourseSession.updateOne({
            course: course._id,
            session: req.params.session
        },{
            $set: {
                examiners: req.body
            }
        })
         
        res.send()
    } catch (error) {
        res.status(400).send({
            error: error.message
        })
    }
})

/**
 * Privilege : COURSE_SESSION_ASSIGN_SCRUTINIZER
 */
router.patch('/update/:courseID/:syllabusID/:session/scrutinizers',
    hasAllPrivileges([constants.PRIVILEGES.COURSE_SESSION_ASSIGN_SCRUTINIZER]) ,
    async (req, res) => {
    try {
        const course = await Course.findOne({
            courseID: req.params.courseID,
            syllabusID: req.params.syllabusID,
        })
        if(!course){
            throw new Error('This course does not exist')
        }
        await CourseSession.updateOne({
            course: course._id,
            session: req.params.session
        },{
            $set: {
                scrutinizers: req.body
            }
        })
        
        res.send()
    } catch (error) {
        res.status(400).send({
            error: error.message
        })
    }
})

/**
 * Privilege : COURSE_SESSION_ASSIGN_INTERNAL
 */
router.patch('/update/:courseID/:syllabusID/:session/internals',
    hasAllPrivileges([constants.PRIVILEGES.COURSE_SESSION_ASSIGN_INTERNAL]) ,
    async (req, res) => {

    try {
        const course = await Course.findOne({
            courseID: req.params.courseID,
            syllabusID: req.params.syllabusID,
        })
        if(!course){
            throw new Error('This course does not exist')
        }
        await CourseSession.updateOne({
            course: course._id,
            session: req.params.session
        },{
            $set: {
                internals: req.body
            }
        })
        
        res.send()
    } catch (error) {
        res.status(400).send({
            error: error.message
        })
    }
})

/**
 * Privilege : COURSE_SESSION_ALLOT_SCHEDULE
 */
router.patch('/update/:courseID/:syllabusID/:session/schedule',
    hasAllPrivileges([constants.PRIVILEGES.COURSE_SESSION_ALLOT_SCHEDULE]),
    async (req, res) => {

    try {
        const course = await Course.findOne({
            courseID: req.params.courseID,
            syllabusID: req.params.syllabusID,
        })
        if(!course){
            throw new Error('This course does not exist')
        }
        await CourseSession.updateOne({
            course: course._id,
            session: req.params.session
        },{
            $set: {
                schedule: req.body
            }
        })
         
        res.send()
    } catch (error) {
        res.status(400).send({
            error: error.message
        })
    }
})

module.exports = router
