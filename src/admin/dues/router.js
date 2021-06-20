const express = require('express')
const mongoose = require('mongoose')

const {Due, LevelChangingFee, ExamFee, DiningFee} = require('./model')
const {PRIVILEGES} = require('../../utils/constants')
const {adminRequired,hasAllPrivileges,hasAnyPrivileges} = require('../../utils/middlewares')
const {addMergePrivileges} = require('../../utils/helpers')
const constants = require('../../utils/constants')
const { User, Student } = require('../accounts/model')

const router = new express.Router()

// dept, hall, level, term, ids
router.post('/create/levelChangingFee/', async (req, res) => {
    let match = {}
    const bulkSize = 2

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
    let cnt = 0, it = 0, totalTime
    try {
        let dues = []
        const startTime = Date.now()
        const cursor = await Student.find(match).cursor()

        await cursor.eachAsync(async function (student) {
            const due = {
                updateOne: {
                    filter: {issuedTo: student._id, session: new Date(req.body.session)} ,
                    update: {
                        amount: req.body.amount,
                        issueDate: Date.now(),
                        deadline: req.body.deadline,
                        delayFine: req.body.delayFine,
                        issuedTo: student.id,
                        level: student.level,
                        term: student.term,
                        session: req.body.session
                    },
                    upsert: true
                }
            }
            dues.push(due)

            if (dues.length === bulkSize) {
                it++
                console.log(`Iteration No ${it}`)
                const res = await runInTransaction(dues)
                cnt += res.upsertedCount + res.modifiedCount
                dues = []
            }
        })

        if (dues.length > 0){
            console.log(`Last iteration!`)
            const res = await runInTransaction(dues)
            cnt += res.upsertedCount + res.modifiedCount
            dues = []
        }
        totalTime = (Date.now() - startTime)
        console.log(`Inserted ${cnt} elements in ${totalTime} ms`)

        res.status(201).send({
            duesModified: cnt
        })

    } catch (error) {
        res.status(400).send({
            error: error.message,
            duesModified: cnt
        })
    }
})

const runInTransaction = async function(dues) {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const res = await LevelChangingFee.bulkWrite(dues, {session})
        await session.commitTransaction()
        return res
    } catch (error){
        await session.abortTransaction()
        throw error
    } finally {
        session.endSession()
    }
}


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