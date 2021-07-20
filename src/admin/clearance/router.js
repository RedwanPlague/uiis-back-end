const express = require('express')

const {Student} = require('../accounts/model')
const {Due} = require('../dues/model')
const {PRIVILEGES} = require('../../utils/constants')
const {adminRequired,hasAllPrivileges,hasAnyPrivileges} = require('../../utils/middlewares')
const {addMergePrivileges} = require('../../utils/helpers')
const constants = require('../../utils/constants')
 

const router = new express.Router()

router.post('/thesis/clear', async (req, res) => {
    try {
        const ids = req.body.ids
        if(!ids){
            throw new Error('No ID selected')
        }
        
        await Promise.all(ids.map(async (id) => {
            await Student.updateOne({
                _id: id
            }, {
                isThesisCleared: true
            })
        }))

        res.send()

    } catch (error) {
        res.status(400).send(error.message)
    }
})

router.get('/status/:id', async (req,res) => {
    try {
        const student = await Student.findById(req.params.id)

        if(!student){
            throw new Error('no such student exist')
        }

        if(req.user._id !== req.params.id){
            throw new Error('permission denied')
        }

        let totalCompletedCredits = 0.0

        if(student.results && student.results.length !== 0){
            totalCompletedCredits = student.results[student.results.length-1].totalCreditHoursCompleted
        }

        const minCreditDone = totalCompletedCredits >= constants.CLEARANCE.MIN_REQ_CREDITS

        const pendingDues = await Due.find({
            issuedTo: req.params.id,
            status: constants.DUE_STATUS.PENDING
        }).count()

        const duesCleared = pendingDues === 0

        const thesisSubmitted = student.isThesisCleared
        const hasApplied = student.hasAppliedForClearance
        const hasGraduated = student.hasGraduated

        res.send({
            minCreditDone,
            duesCleared,
            thesisSubmitted,
            hasApplied,
            hasGraduated
        })
        
    } catch (error) {
        res.status(400).send(error.message)
    }
})

router.post('/apply/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)

        if(!student){
            throw new Error('no such student exist')
        }

        if(req.user._id !== req.params.id){
            throw new Error('permission denied')
        }
 
        student.hasAppliedForClearance = true
        student.save()

        res.send()
        
    } catch (error) {
        res.status(400).send(error.message)
    }
})



// router.post()
module.exports = router
