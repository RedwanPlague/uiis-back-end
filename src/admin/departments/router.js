const express = require('express')

const Department = require('./model')
const {logInRequired, adminRequired} = require('../../utils/middlewares')

const router = new express.Router()

// checking proper privilege
router.post('/departments', adminRequired, async (req, res)=> {
    const department = new Department(req.body)
    try {
        await department.save()
        res.status(201).send(department)
    } catch (error) {
        res.status(400).send()
    }
})

// check proper privilege and if teacher with head id exists?
router.patch('/departments/:id', adminRequired, async (req, res)=> {
    const allowedUpdates = ['name', 'head']
    const updates = Object.keys(req.body)

    const isValid = updates.every(
        u => allowedUpdates.includes(u)
    )

    if (!isValid) {
        return res.status(400).send({
            error: "Invalid Updates!"
        })
    }
    try {
        const department = await Department.findById(req.params.id)
        updates.forEach(u => department[u] = req.body[u])
        await department.save()

        res.send(department)

    } catch (error){
        res.status(400).send()
    }
})

// proper authentication
router.get('/departments', adminRequired, async (req, res)=> {
    try{
        const departments = await Department.find({})
        res.send(departments)

    } catch(error) {
        res.status(400).send()
    }
})


module.exports = router