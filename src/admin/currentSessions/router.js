const express = require('express')
const CurrentSession = require('./model')
const {hasAllPrivileges} = require('../../utils/middlewares')
const {PRIVILEGES} = require('../../utils/constants')


const router = new express.Router()

/**
 * Privilege: N/A
 * but add LoginRequired
 */
router.get('/', async (req, res)=>{
    try{
        const currentSession = await CurrentSession.findOne({})
        res.send(currentSession)

    } catch (e){
        res.status(400).send({
            error: e.message
        })
    }
})
/**
 * Privilege: CURRENT_SESSION_UPDATE
 */

router.patch('/update',hasAllPrivileges([PRIVILEGES.CURRENT_SESSION_UPDATE]), async (req, res)=>{
    try {
        const currentSession = await CurrentSession.findOne({})
        currentSession.session = req.body.session

        await currentSession.save()
        res.status(201).send(currentSession)

    } catch (e){
        res.status(400).send({
            error: e.message
        })
    }
})

module.exports = router