const express = require('express')

const {User, Student, Teacher, Admin} = require('./model')
const {PRIVILEGES} = require('../../utils/constants')
const {logInRequired, adminRequired} = require('../../utils/middlewares')
const constants = require('../../utils/constants')
const Department = require('../departments/model')

const router = new express.Router()

router.post('/create', async (req, res) => {
    try {
        let user = undefined

        if (req.body.userType === constants.USER_TYPES.STUDENT) {
            user = new Student(req.body)
        } else if(req.body.userType === constants.USER_TYPES.TEACHER) {
            user = new Teacher(req.body)
        } else if(req.body.userType === constants.USER_TYPES.ADMIN) {
            user = new Admin(req.body)
        } else {
            throw new Error('Invalid user type')
        }
        await user.save()
        res.status(201).send()
    } catch (error) {
        res.status(400).send({
            error: error.message
        })
    }
})


router.patch('/update/student/:id', async (req, res) => {
    console.log('hi')
    const updates = Object.keys(req.body)
    
    try {

        const student = await Student.findOne({
            _id : req.params.id
        })

        if (!student) {
            throw new Error('Student not found')
        }
        
        updates.forEach((update) => student.set(update, req.body[update]))

        await student.save()

        res.send()

    } catch (error) {
        res.status(400).send({error: error.message})
    }

})


router.patch('/update/teacher/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    
    try {
        const teacher = await Teacher.findOne({
            _id : req.params.id
        })

        if (!teacher) {
            throw new Error('Teacher not found')
        }
        
        updates.forEach((update) => teacher.set(update, req.body[update]))

        await teacher.save()

        res.send()

    } catch (error) {
        res.status(400).send({error: error.message})
    }

})

router.patch('/update/admin/:id', async (req, res) => {
    const updates = Object.keys(req.body)

    try {

        const admin = await Admin.findOne({
            _id : req.params.id
        })

        if (!admin) {
            throw new Error('Admin not found')
        }

        updates.forEach((update) => admin.set(update, req.body[update]))

        await admin.save()

        res.send(admin)

    } catch (error) {
        res.status(400).send({error: error.message})
    }

})

/**
 * Here is the getters
 */


router.get('/admin/list', adminRequired, async (req, res) => {
    let match = {}

    const queryList = ['name','email','contactNumber','designation']

    for (const queryParams of Object.keys(req.query)) {
        if(queryList.includes(queryParams)) {
            match[queryParams] = req.query[queryParams]
        }
    }
    if (req.query.name) {
        match.name = {
            $regex : new RegExp(req.query.name, 'i')
        }
    }

    if (req.query.designation) {
        match.designation = {
            $regex : new RegExp(req.query.designation, 'i')
        }
    }
    if(req.query.id) {
        match['_id'] = req.query.id
    }

   try {
        const admins = await Admin.find(match)
        res.send(admins)
        
    } catch (error) {
        res.status(500).send()
    }
     
})

router.get('/student/list', adminRequired, async (req, res) => {
    let match = {}

    const queryList = ['name','email','contactNumber','department',
        'hall', 'advisor', 'level', 'term','cgpa']

    for (const queryParams of Object.keys(req.query)) {
        if(queryList.includes(queryParams)) {
            match[queryParams] = req.query[queryParams]
        }
    }

    if (req.query.name) {
        match.name = {
            $regex : new RegExp(req.query.name, 'i')
        }
    }
    if(req.query.id) {
        match['_id'] = req.query.id
    }

    try {
        const students = await Student.find(match)
        res.send(students)

    } catch (error) {
        res.status(500).send()
    }

})

router.get('/teacher/list', adminRequired, async (req, res) => {
    let match = {}

    const queryList = ['name','email','contactNumber','department']

    for (const queryParams of Object.keys(req.query)) {
        if(queryList.includes(queryParams)) {
            match[queryParams] = req.query[queryParams]
        }
    }
    if (req.query.name) {
        match.name = {
            $regex : new RegExp(req.query.name, 'i')
        }
    }

    if(req.query.id) {
        match['_id'] = req.query.id
    }

    try {
        const teachers = await Teacher.find(match)
        res.send(teachers)

    } catch (error) {
        req.status(500).send()
    }

})

router.get('/privileges', logInRequired, async (req, res)=> {
    try {
        res.send(Object.values(PRIVILEGES))
    } catch (error) {
        res.status(500).send()
    }
})



router.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(
            req.body.id,
            req.body.password
        )
        const token = await user.generateAuthToken()
        user.tokens = user.tokens.concat({ token })
        await user.save()

        res.send({user,token})
    } catch (error) {
        res.status(400).send({error: error.message})
    }
})

router.post('/auto-login', logInRequired, async (req, res) => {
    try {
        res.send(req.user)
    } catch (error){
        res.status(500).send()
    }
})

router.post('/logout', logInRequired, async (req, res)=> {
    try {
        const user = req.user
        user.tokens = user.tokens.filter(token => token.token !== req.token)
        await user.save()
        res.send()

    } catch (error){
        res.status(500).send()
    }
})

// router.post()
module.exports = router
