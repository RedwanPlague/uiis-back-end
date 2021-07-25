const express = require('express')

const CurrentSession = require('./model')
const {CourseSession} = require('../courseSessions/model')
const Course = require('../courses/model')
const {hasAllPrivileges} = require('../../utils/middlewares')
const {PRIVILEGES} = require('../../utils/constants')
const {Student} = require('../accounts/model')
const {CourseRegistration} = require('../courseRegistrations/model')
const constants = require('../../utils/constants')


const router = new express.Router()


/**
 * Privilege: N/A
 * but add LoginRequired
 */
router.get('/', async (req, res) => {
    try{
        const currentSession = await CurrentSession.findOne({})
        res.send(currentSession)
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

            if(new Date(req.body.session).getTime() === currentSession.session.getTime()){
                throw new Error('update date!')
            }
            currentSession.session = req.body.session
            currentSession.coursesToOffer = []
        }
        await currentSession.save()

        await updateLevelTerm()

        res.send()
    } catch(e) {
        res.status(400).send({
            error: e.message
        })
    }
})

router.patch('/update/coursesToOffer',
    hasAllPrivileges([PRIVILEGES.COURSE_SESSION_CREATION]),
    async (req, res)=>{

    try {
        const currentSession = await CurrentSession.findOne({})
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

        res.send()
    } catch(e) {
        res.status(400).send({
            error: e.message
        })
    }
})


router.get('/coursesToOffer',
    hasAllPrivileges([PRIVILEGES.COURSE_SESSION_CREATION]),
    async (req,res) => {
    try {
        const currentSession = await CurrentSession.findOne({})
        let courses = []

        await Promise.all(currentSession.coursesToOffer.map(async (value) => {
            const course = await Course.findById(value)
            if (!course){
                throw new Error(`(courseID: ${value.courseID},syllabusID: ${value.syllabusID}) does not exist`)
            }
            courses.push({
                courseID: course.courseID,
                syllabusID: course.syllabusID
            })
        }))
        res.send({coursesToOffer: courses}) 
        
    } catch(e) {
        res.status(400).send({
            error: e.message
        })
    }
})


router.get('/coursesToOfferWithTitle',
    hasAllPrivileges([PRIVILEGES.COURSE_SESSION_CREATION]),
    async (req,res) => {
    try {
        const currentSession = await CurrentSession.findOne({})
        let courses = []

        await Promise.all(currentSession.coursesToOffer.map(async (value) => {
            const course = await Course.findById(value)
            if (!course){
                throw new Error(`(courseID: ${value.courseID},syllabusID: ${value.syllabusID}) does not exist`)
            }
            courses.push({
                courseID: course.courseID,
                syllabusID: course.syllabusID,
                title: course.title
            })
        }))
        res.send({coursesToOffer: courses}) 
        
    } catch(e) {
        res.status(400).send({
            error: e.message
        })
    }
})

router.post('/newCourseSessionsBatch',
    hasAllPrivileges([PRIVILEGES.COURSE_SESSION_CREATION]),
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

           await newCourseRegistration()

            res.send() 
        } catch (error) {
            res.status(400).send(error.message)
        }
    }
)

const newCourseRegistration = async () =>{

    const currentSession = await CurrentSession.findOne()
    const courseSessions = await CourseSession.
        find({session : currentSession.session}).
        populate({
        path : 'course',
        select: 'prerequisites level term'
    })


    const students = await Student.find({}).populate({
        path: 'registrationList',
        select: 'status courseSession',
        populate: {
            path: 'courseSession',
            select: 'course'
        }
    })

    let newRegistrationList = []

    for (const student of students){
        for (const courseSession of courseSessions){
            if (courseSession.course.level !== student.level || courseSession.course.term !== student.term)
                continue

            let canTake = true
            for (const pre of courseSession.course.prerequisites){
                let passed = false

                for (const regEl of student.registrationList) {

                    if (regEl.courseSession.course.equals(pre._id)){
                        passed |= (regEl.status === 'passed')
                    }
                }
                canTake &= passed
            }

            if (canTake) {
                const courseRegistration = new CourseRegistration(
                    {
                        student: student._id,
                        courseSession: courseSession._id
                    }
                )
                courseRegistration.status = 'offered'
                courseRegistration.level = student.level
                courseRegistration.term = student.term
                await courseRegistration.save()
                newRegistrationList.push(courseRegistration)
            }
        }
    }

    for (const newRegistration of newRegistrationList){
        
        const student = await Student.findById(newRegistration.student)
        const courseSession = await CourseSession.findById(newRegistration.courseSession)

        student.registrationList.push(newRegistration)
        courseSession.registrationList.push(newRegistration)

        await student.save()
        await courseSession.save()
    }
}



const updateLevelTerm = async() => {
    
    const students = await Student.find({})

    await Promise.all(students.map(async (student) => {

        // if(student.isNewStudent){
        //     student.isNewStudent = false
        // }
        // else{
        let level = student.level
        let term = student.term + 1

        if(term > constants.MAX_TERM){
            term = 1
            level += 1
        }

        if(level > constants.MAX_LEVEL) {
            level = constants.MAX_LEVEL
            term = constants.MAX_TERM
            student.hasGraduated = true
        }
        else {
            student.status = 'unregistered'
        }

        student.level = level
        student.term = term
        // }

        await student.save()

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
