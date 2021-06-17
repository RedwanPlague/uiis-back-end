
const express = require('express')

const {Due, LevelChangingFee, ExamFee, DiningFee} = require('./model')
const {PRIVILEGES} = require('../../utils/constants')
const {adminRequired,hasAllPrivileges,hasAnyPrivileges} = require('../../utils/middlewares')
const {addMergePrivileges} = require('../../utils/helpers')
const constants = require('../../utils/constants')

const router = new express.Router()


router.post('/create', async (req, res) => {
    try {
        let due = undefined

        if (req.body.dueType === constants.DUE_TYPES.LEVEL_CHANGING_FEE) {
            // due = new LevelChangingFee(req.body)
        } else if(req.body.dueType === constants.DUE_TYPES.DINING_FEE) {
            // due = new DiningFee(req.body)
        } else if(req.body.dueType === constants.DUE_TYPES.EXAM_FEE) {
            // due = new ExamFee(req.body)
        } else {
            throw new Error('Invalid due type')
        }
        await due.save()
        res.status(201).send()
    } catch (error) {
        res.status(400).send({
            error: error.message
        })
    }
})


module.exports = router