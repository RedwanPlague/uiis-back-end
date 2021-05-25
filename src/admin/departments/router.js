const express = require('express')

const Department = require('./model')
const {logInRequired, adminRequired} = require('../../utils/middlewares')

const router = new express.Router()

// checking proper privilege
router.post('/create', adminRequired, async (req, res)=> {
    const department = new Department(req.body)
    try {
        await department.save()
        res.status(201).send(department)
    } catch (error) {
        res.status(400).send({
            error: error.message
        })
    }
})

// check proper privilege and if teacher with head id exists?
router.patch('/update/:id', adminRequired, async (req, res)=> {
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
        if (!department) {
            throw new Error("No department found!")
        }
        updates.forEach(u => department[u] = req.body[u])
        await department.save()

        res.send(department)

    } catch (error){
        res.status(400).send({
            error: error.message
        })
    }
})

// proper authentication
router.get('/list', adminRequired, async (req, res)=> {
    try{
        const departments = await Department.find({})
        res.send(departments)

    } catch(error) {
        res.status(400).send()
    }
})

module.exports = router