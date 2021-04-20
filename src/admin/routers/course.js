const express = require('express')
const Course = require('../models/course')

const router = new express.Router()

router.post('/create-course', async (req, res) => {
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

module.exports = router