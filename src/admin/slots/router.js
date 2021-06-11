const express = require('express')
const Slot = require('./model')
 
const router = new express.Router()
/**
 * Privilege: SLOT_CREATION
 */
router.post('/create', async (req, res)=> {
    try {
        const slot = new Slot(req.body)
        await slot.save()
        res.status(201).send()
    } catch (error) {
        res.status(400).send({error: error.message})
    }     
})

/**
 * Privilege: SLOT_UPDATE
 */
router.patch('/update/:id', async (req, res)=> {
    const updates = Object.keys(req.body)

    try {
        const slot = await Slot.findById(req.params.id)
        if(!slot)
            throw new Error('Invalid slot')
        updates.forEach((update) => slot.set(update, req.body[update]))
        await slot.save()
        res.send()
    } catch (error) {
        res.status(400).send({error: error.message})
    }     
})

/**
 * Privilege: N/A
 * adminRequired
 */
router.get('/list', async (req, res) => {
    try {
        const slots = await Slot.find({})
        res.send(slots)
    } catch (error) {
        res.status(400).send({error: error.message})
    }
})

module.exports = router