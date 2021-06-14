const express = require('express')

const Course = require('./model')
const {courseCreationAuth} = require('./middlewares')
const constants = require('../../utils/constants')
const {adminRequired,hasAllPrivileges,hasAnyPrivileges} = require('../../utils/middlewares')

const router = new express.Router()

/**
 * privilege: COURSE_CREATION
 */

router.post('/create',hasAllPrivileges([constants.PRIVILEGES.COURSE_CREATION]), async (req, res) => {

    try {
        if (req.body.prerequisites){
            let prerequisites = []
            await Promise.all(req.body.prerequisites.map(async (value) => {
                const course = await Course.findOne(value)
                if (!course){
                    throw new Error(`(courseID: ${value.courseID},syllabusID: ${value.syllabusID}) does not exist`)
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

/**
 * privilege: COURSE_CREATION || COURSE_UPDATE || COURSE_DELETION
 */
router.get('/list',
    hasAnyPrivileges([constants.PRIVILEGES.COURSE_CREATION,
        constants.PRIVILEGES.COURSE_UPDATE,
        constants.PRIVILEGES.COURSE_DELETION
    ]),async (req, res) => {

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

    if (req.query.title) {
        match.title = {
            "$regex" : new RegExp(req.query.title, 'i')
        }
    }

    match['credit'] = {
        "$gte": creditMin,
        "$lte": creditMax
    }

   try {
        const courses = await Course.find(match).populate({
            path: 'prerequisites',
            select: 'courseID syllabusID -_id'
        })
        res.send(courses)
        
    } catch (error) {
        res.status(500).send()
    }
})
/**
 * privilege:  COURSE_UPDATE
 */
router.patch('/update/:courseID/:syllabusID', hasAllPrivileges([constants.PRIVILEGES.COURSE_UPDATE]), async (req, res) => {
    const updates = Object.keys(req.body)
    try {
        const course = await Course.findOne({
            courseID : req.params.courseID,
            syllabusID: req.params.syllabusID
        })
        if (!course) {
            throw new Error('Course not found')
        }
        updates.forEach((update) => {
            if (update !== 'prerequisites') {
                course.set(update, req.body[update])
            }
        })
        if (req.body.prerequisites){
            let prerequisites = []
            await Promise.all(req.body.prerequisites.map(async (value) => {
                const course = await Course.findOne(value)
                if (!course){
                    throw new Error(`(courseID: ${value.courseID},syllabusID: ${value.syllabusID}) does not exist`)
                }
                prerequisites.push(course._id)
            }))
            course.prerequisites = prerequisites
        }
        await course.save()
        res.send(course)
    } catch (error) {
        res.status(400).send({error: error.message})
    }
})

module.exports = router