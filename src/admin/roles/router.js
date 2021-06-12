const express = require('express')

const {PRIVILEGES} = require('../../utils/constants')
const {Role} = require('./model')

const router = new express.Router()

/**
 * Privilege: ROLE_CREATION
 */
router.post('/create', async (req, res)=> {
    try{
       const role = new Role(req.body)
       await role.save()
       res.status(201).send(role)
    } catch (e){
        res.status(400).send({
            msg: e.message
        })
    }
})

/**
 * Privilege: ROLE_UPDATE
 */
router.patch('/update/:id', async (req, res)=> {
    try{
        const role = await Role.findById(req.params.id)
        if (!role){
            throw new Error(`No role named {req.params.id} found`)
        }
        role.privileges = req.body.privileges
        await role.save()
        res.status(200).send(role)
    } catch (e){
        res.status(400).send({
            msg: e.message
        })
    }
})

/**
 * Privilege: N/A
 * adminRequired
 */
router.get('/list', async (req, res)=> {
    try{
        const roles = await Role.find({})
        res.send(roles)
    } catch (e){
        res.status(500).send({
            msg: e.message
        })
    }
})


module.exports = router