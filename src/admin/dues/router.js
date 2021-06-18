
const express = require('express')

const {Due, LevelChangingFee, ExamFee, DiningFee} = require('./model')
const {PRIVILEGES} = require('../../utils/constants')
const {adminRequired,hasAllPrivileges,hasAnyPrivileges} = require('../../utils/middlewares')
const {addMergePrivileges} = require('../../utils/helpers')
const constants = require('../../utils/constants')
const { User, Student } = require('../accounts/model')

const router = new express.Router()

// dept, hall, level, term, ids
router.post('/create/levelChangingFee/', async (req, res) => {
    try {

        let match = {}
        if (req.body.department){
            match.department = req.body.department
        }
        if (req.body.hall){
            match.hall = req.body.hall
        }
        if (req.body.term){
            match.term = req.body.term
        }
        if (req.body.level){
            match.level = req.body.level
        }
        if (req.body.ids){
            match._id = {
                $in: req.body.ids
            }
        }
        const students = await Student.find(match)

        await Promise.all(students.map(async (student) => {
            const due = new LevelChangingFee({
                amount: req.body.amount,
                issueDate: Date.now(),
                deadline: req.body.deadline,
                delayFine: req.body.delayFine,
                issuedTo: student.id,
                level: student.level,
                term: student.term,
                dueType: req.body.dueType,
                session: req.body.session
            })
            await due.save()
        }))

        res.status(201).send()
    } catch (error) {
        res.status(400).send({
            error: error.message
        })
    }
})


router.patch('/update/levelChangingFee/', async (req, res) => {
    try {

        let match = {}
        if (req.body.department){
            match.department = req.body.department
        }
        if (req.body.hall){
            match.hall = req.body.hall
        }
        if (req.body.term){
            match.term = req.body.term
        }
        if (req.body.level){
            match.level = req.body.level
        }
        if (req.body.ids){
            match.issuedTo = {
                $in: req.body.ids
            }
        }
        if (req.body.session){
            match.session = req.body.session
        }

        let updateList = {}
        if(req.body.amount){
            updateList.amount = req.body.amount
        }
        if(req.body.deadline){
            updateList.deadline = req.body.deadline
        }
        if(req.body.delayFine){
            updateList.delayFine = req.body.delayFine
        }
        await LevelChangingFee.updateMany(match, {
            $set: updateList
        })
         
        res.status(200).send()
    } catch (error) {
        res.status(400).send({
            error: error.message
        })
    }
})


module.exports = router