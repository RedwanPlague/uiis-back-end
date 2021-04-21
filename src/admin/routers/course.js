const express = require('express')
const Course = require('../models/course')

const router = new express.Router()

router.post('/courses', async (req, res) => {
    const course = new Course(req.body)

    try {
        await course.save()
        res.status(201).send()
    } catch (error) {
        res.status(400).send({
            error: error.message
        })
    }
})

router.get('/courses', async (req, res) => {
    
    // console.log(Course.schema.eachPath((path) => {
    //     console.log(path, Course.schema.paths[path].instance)
    // }))

    try {
        const courses = await Course.find({})
        res.send(courses)
        
    } catch (error) {
        req.status(500).send()
    }
})

router.patch('/courses/:code', async (req, res) => {
    const updates = Object.keys(req.body)
    
    try {
        const course = await Course.findOne({
            code: req.params.code
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