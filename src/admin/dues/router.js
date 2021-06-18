
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

        res.status(201).send(students)
    } catch (error) {
        res.status(400).send({
            error: error.message
        })
    }
})


module.exports = router