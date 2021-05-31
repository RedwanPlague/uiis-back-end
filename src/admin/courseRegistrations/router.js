const express = require('express')
const {CourseRegistration} = require('./model')
const CurrentSession = require('../currentSessions/model')
const {CourseSession} = require('../courseSessions/model')
const {User,Student} = require('../accounts/model')

const router = new express.Router()

router.post('/dummy', async (req, res)=> {
    try {
        const currentSession = await CurrentSession.findOne()
        const courseSessions = await CourseSession.find({})
        const students = await User.find({userType: 'student'})

        for (const courseSession of courseSessions){
            if (courseSession.session.getTime() === currentSession.session.getTime()) continue;
            courseSession.registrationList = []
            await courseSession.save()
        }

        for (const student of students){
            student.registrationList = []
            await student.save()
        }

        for (const courseSession of courseSessions){

            if (courseSession.session.getTime() === currentSession.session.getTime()) continue;

            for (const student of students){

                const courseRegistration = new CourseRegistration(
                    {
                        student: student._id,
                        courseSession: courseSession._id
                    }
                )
                courseRegistration.status = 'passed'

                courseRegistration.result = {
                    gradePoint: 4,
                    gradeLetter: 'A+',
                    percentage: 81
                }
                await courseRegistration.save()

                courseSession.registrationList.push(courseRegistration)
                student.registrationList.push(courseRegistration)

                await courseSession.save()
                await student.save()
            }
        }
        res.send()
    } catch (error){
        res.status(400).send({error: error.message})
    }
})

router.post('/newSessionBatch', async (req, res)=> {
    try {
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

        // students.forEach(value => {
        //     console.log(value.name)
        //     console.log(value)
        // })

        // courseSessions.forEach(value => {
        //     console.log(value._id)
        //     console.log(value.course)
        // })

        let newRegistrationList = []

        for (const student of students){
            for (const courseSession of courseSessions){
                if (courseSession.course.level !== student.level || courseSession.course.term !== student.term)
                    continue

                let canTake = true
                for (const pre of courseSession.course.prerequisites){
                    let passed = false

                    for (const regEl of student.registrationList) {
                        
                        // if(!regEl.courseSession.course){
                        //     console.log(student._id,courseSession.course._id)
                        //     continue
                        // }

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
                    await courseRegistration.save()

                    // courseSession.registrationList.push(courseRegistration)
                    // student.registrationList.push(courseRegistration)

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

        

        res.send()
    } catch (error){
        res.status(400).send({error: error.message})
    }
})


/**
 * Current Session routers
 */

module.exports = router

