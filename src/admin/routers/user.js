const express = require('express')
const User = require('../models/user')

const router = new express.Router()

router.post('/create-account', async (req, res) => {
    const user = new User(req.body)
    try {
        const token = await user.generateAuthToken()
        user.tokens = user.tokens.concat({ token })
        await user.save()
        res.status (201).send({token})
    } catch (error) {
        res.status(400).send({
            error: error.message
        })
    }
})


router.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(
            req.body.userID,
            req.body.password
        )
        const token = await user.generateAuthToken()
        user.tokens = user.tokens.concat({ token })
        await user.save()

        res.send({token})
    } catch (error) {
        res.status(400).send({error: error.message})
    }
})

module.exports = router
