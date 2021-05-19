const express = require('express')

const Course = require('./model')
const {courseCreationAuth} = require('./middlewares')

const router = new express.Router()


router.post('/create', courseCreationAuth, async (req, res) => {

    try {
        if (req.body.prerequisites){
            let prerequisites = []
            await Promise.all(req.body.prerequisites.map(async (value) => {
                const course = await Course.findOne(value)
                if (!course){
                    throw new Error(value + " does not exist")
                }
                prerequisites.push(course._id)
            }))

            req.body.prerequisites = prerequisites
        }

        
        const course = new Course(req.body)
        await course.save()
        
        res.status(201).send()
    } catch (error) {
        res.status(400).send({
            error: error.message
        })
    }
})

router.get('/list', async (req, res) => {
    let match = {}

    if (req.query.department) {
        match.offeredToDepartment = req.query.department 
    }
    if (req.query.courseID) {
        match.courseID = req.query.courseID
    }
    if (req.query.syllabusID) {
       match.syllabusID = req.query.syllabusID
    }
 
   try {
        const courses = await Course.find(match)
        res.send(courses)
        
    } catch (error) {
        req.status(500).send()
    }
})

router.patch('/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    
    try {

        const course = await Course.findOne({
            _id : req.params.id
        })

        if (!course) {
            throw new Error('Course not found')
        }
        
        updates.forEach((update) => course.set(update, req.body[update]))

        await course.save()

        res.send(course)

    } catch (error) {
        res.status(400).send({error: error.message})
    }

})

module.exports = router