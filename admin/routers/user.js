const express = require('express')
const User = require('../models/user')

const router = new express.Router()

router.post('/create-account', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        user.tokens = user.tokens.concat({token})
        await user.save()

        res.status(201).send({token})
    } catch (e){
        res.status(400).send({
            error: e.message
        })
    }
})

module.exports = router