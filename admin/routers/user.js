const express = require('express')
const User = require('../models/user')

const router = new express.Router()

router.post('/create-account', async (req, res) => {
    const user = new User(req.body)
    try {
        user.set('testID',"test1")
        await user.save()
        console.log(user)
        const token = await user.generateAuthToken()
        res.status (201).send({token})
    } catch (error) {
        res.status(400).send({
            error: e.message
        })
    }
})

module.exports = router