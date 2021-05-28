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
        'courseID','syllabusID','level','term','courseID','syllabusID',
        'title','credit'
    ]

    for (const queryParams of Object.keys(req.query)) {
        if(queryList.includes(queryParams)) {
            match[queryParams] = req.query[queryParams]
        }
    }

   try {
        const courses = await Course.find(match)
        res.send(courses)
        
    } catch (error) {
        req.status(500).send()
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