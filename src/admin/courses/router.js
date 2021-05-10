const express = require('express')

const Course = require('./model')
const {courseCreationAuth} = require('./middlewares')

const router = new express.Router()


router.post('', courseCreationAuth, async (req, res) => {
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

router.get('/list', async (req, res) => {

    try {
        const courses = await Course.find({})
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