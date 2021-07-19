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
        currentSession.session = req.body.session
        await currentSession.save()
        // await createNewCourseSessions(currentSession)

        res.status(201).send(currentSession)
    } catch(e) {
        res.status(400).send({
            error: e.message
        })
    }
})


const createNewCourseSessions = async (currentSession) => {
    const courses = await Course.find({})

    await Promise.all(courses.map(async (course) => {
        const courseSession = new CurrentSession({
            course,
            session: currentSession.session
        })
        await courseSession.save()
    }))
}


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
