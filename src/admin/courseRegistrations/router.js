const express = require('express')
const CourseRegistration = require('./model')
const {CourseSession} = require('../courseSessions/model')
const {User} = require('../accounts/model')

const router = new express.Router()

router.post('/dummy', async (req, res)=> {
    try {
        const courseSessions = await CourseSession.find({})
        const students = await User.find({userType: 'student'})

        for (const courseSession of courseSessions){
            for (const student of students){
                const courseRegistraion = new CourseRegistration(
                    {
                        student: student._id,
                        courseSession: courseSession._id
                    }
                )
                await courseRegistraion.save()
            }
        }
        res.send()
    } catch (error){
        res.status(400).send({error: error.message})
    }
})




module.exports = router

