const express = require('express')

const Hall = require('./model')
const {logInRequired, adminRequired} = require('../../utils/middlewares')

const router = new express.Router()

// checking proper privilege
router.post('/halls', adminRequired, async (req, res)=> {
    const hall = new Hall(req.body)
    try {
        await hall.save()
        res.status(201).send(hall)
    } catch (error) {
        res.status(400).send()
    }
})

// check proper privilege and if teacher with provost id exists?
router.patch('/halls/:id', adminRequired, async (req, res)=> {
    const allowedUpdates = ['name', 'provost']
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
        const hall = await Hall.findById(req.params.id)
        updates.forEach(u => hall[u] = req.body[u])
        await hall.save()

        res.send(hall)

    } catch (error){
        res.status(400).send()
    }
})

// proper authentication
router.get('/halls', adminRequired, async (req, res)=> {
    try{
        const halls = await Hall.find({})
        res.send(halls)

    } catch(error) {
        res.status(400).send()
    }
})


module.exports = router