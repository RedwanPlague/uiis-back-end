const express = require('express')

const CurrentSession = require('./model')
const CourseSession = require('../courseSessions/model')
const Course = require('../courses/model')
const {hasAllPrivileges} = require('../../utils/middlewares')
const {PRIVILEGES} = require('../../utils/constants')


const router = new express.Router()


/**
 * Privilege: N/A
 * but add LoginRequired
 */
router.get('/', async (req, res) => {
    try{
        const currentSession = await CurrentSession.findOne({})
        res.status(200).send(currentSession)
    } catch(e) {
        res.status(400).send({
            error: e.message
        })
    }
})

/**
 * Privilege: CURRENT_SESSION_UPDATE
 */

router.patch('/update',
    hasAllPrivileges([PRIVILEGES.CURRENT_SESSION_UPDATE]),
    async (req, res)=>{

    try {
        const currentSession = await CurrentSession.findOne({})

        if(req.body.session){
            currentSession.session = req.body.session
        }
        
        if(req.body.coursesToOffer){
            
            let courses = []
            await Promise.all(req.body.coursesToOffer.map(async (value) => {
                const course = await Course.findOne(value)
                if (!course){
                    throw new Error(`(courseID: ${value.courseID},syllabusID: ${value.syllabusID}) does not exist`)
                }
                courses.push(course._id)
            }))
            currentSession.coursesToOffer = courses
        }

        await currentSession.save()

        // await createNewCourseSessions(currentSession)

        res.status(201).send(currentSession)
    } catch(e) {
        res.status(400).send({
            error: e.message
        })
    }
})


router.post('/newCourseSessionsBatch/',
    hasAllPrivileges([PRIVILEGES.CURRENT_SESSION_UPDATE]),
    async (req, res) => {
        try {
            const currentSession = await CurrentSession.findOne({})
            const coursesToOffer = currentSession.coursesToOffer

            await Promise.all(coursesToOffer.map(async (courseID) => {
                const courseSession = new CourseSession({
                    course: courseID,
                    session: currentSession.session
                })
                await courseSession.save()
            }))
            res.send() 
        } catch (error) {
            res.status(400).send()
        }
})


 


router.patch('/minimum_credit/update', async (req, res) => {
    try {
        const currentSession = await CurrentSession.findOne({});
        currentSession.minimumCreditHourRequired = req.body.minimumCreditHourRequired;

        await currentSession.save();
        res.status(201).send(currentSession);
    } catch(e) {
        res.status(400).send({
            error: e.message
        });
    }
});

router.patch('/registration_period/update', async (req, res) => {
    try {
        const currentSession = await CurrentSession.findOne({});
        currentSession.isRegistrationPeriodRunning = req.body.isRegistrationPeriodRunning;

        await currentSession.save();
        res.status(201).send(currentSession);
    } catch(e) {
        res.status(400).send({
            error: e.message
        });
    }
});

module.exports = router
