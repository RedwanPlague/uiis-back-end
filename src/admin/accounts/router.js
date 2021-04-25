const express = require('express')

const User = require('./model')
const {PRIVILEGES} = require('../../utils/constants')
const {logInRequired, adminRequired} = require('../../utils/middlewares')
const constants = require('../../utils/constants')

const router = new express.Router()


router.get('/teachers', adminRequired, async (req, res) => {
    try {
        const teachers = await User.find({
            department: req.query.dept,
            userType: constants.USER_TYPES.TEACHER
        })

        res.send(teachers)
    } catch (error) {
        res.status(400).send()
    }
})

router.get('/privileges', logInRequired, async (req, res)=> {
    try {
        res.send(Object.values(PRIVILEGES))
    } catch (error) {
        res.status(500).send()
    }
})

router.post('/create-account', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        res.status(201).send()
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
