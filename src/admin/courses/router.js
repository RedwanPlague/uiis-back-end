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

    const queryList = ['offeredToDepartment', 'offeredByDepartment',
        'level','term','courseID','syllabusID',
        'title'
    ]

    for (const queryParams of Object.keys(req.query)) {
        if(queryList.includes(queryParams)) {
            match[queryParams] = req.query[queryParams]
        }
    }
    let creditMin = 0, creditMax = 10 // assuming credit max = 10, credit min = 0
    if (req.query.creditMin) {
        creditMin = Math.max(creditMin, parseFloat(req.query.creditMin))
    }
    if (req.query.creditMax) {
        creditMax = Math.min(creditMax, parseFloat(req.query.creditMax))
    }

    match['credit'] = {
        "$gte": creditMin,
        "$lte": creditMax
    }

   try {
        const courses = await Course.find(match)
        res.send(courses)
        
    } catch (error) {
        res.status(500).send()
    }
})

router.patch('/update/:courseID/:syllabusID', async (req, res) => {
    const updates = Object.keys(req.body)
    
    try {

        const course = await Course.findOne({
            courseID : req.params.courseID,
            syllabusID: req.params.syllabusID
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