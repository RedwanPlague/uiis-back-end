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
router.post('/upsert/', async (req, res) => {
    let match = {}
    const bulkSize = 2
    let cnt = 0, it = 0, totalTime

    try {
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
        if (!req.body.dueType) {
            throw new Error("Due type not specified!")
        }

        let filterParam = {}
        filterParam.dueType = req.body.dueType


        if(req.body.dueType === constants.DUE_TYPES.LEVEL_CHANGING_FEE || req.body.dueType === constants.DUE_TYPES.EXAM_FEE){
            if (!req.body.session) {
                throw new Error("Session is not specified!")
            }
            if(req.body.session){
                filterParam.session = new Date(req.body.session)
            }
        }
        if(req.body.dueType === constants.DUE_TYPES.DINING_FEE){
            if (!req.body.yearMonth) {
                throw new Error("yearMonth is not specified!")
            }
            if(req.body.yearMonth){
                filterParam.yearMonth = new Date(req.body.yearMonth)
            }
        }

        let dues = []
        const startTime = Date.now()
        const cursor = await Student.find(match).cursor()
        let mongoDue = undefined

        await cursor.eachAsync(async function (student) {
            const due = {
                updateOne: {
                    filter: {issuedTo: student._id, ...filterParam} ,
                    update: {
                        amount: req.body.amount,
                        issueDate: Date.now(),
                        deadline: req.body.deadline,
                        delayFine: req.body.delayFine,
                        issuedTo: student.id,
                        level: student.level,
                        term: student.term,
                        status: constants.DUE_STATUS.PENDING,
                        ...filterParam
                    },
                    upsert: true
                }
            }
            mongoDue = new Due({
                // amount: req.body.amount,
                amount: req.body.amount,
                issueDate: Date.now(),
                deadline: req.body.deadline,
                delayFine: req.body.delayFine,
                issuedTo: student.id,
                level: student.level,
                term: student.term,
                status: constants.DUE_STATUS.PENDING,
                ...filterParam
            })
            const err = mongoDue.validateSync()
            if (err) {
                throw new Error(err)
            }
            dues.push(due)
            if (dues.length === bulkSize) {
                it++
                console.log(`Iteration No ${it}`)
                const res = await runInTransaction(dues, Due)
                cnt += res.upsertedCount + res.modifiedCount
                dues = []
            }
        })
        if (dues.length > 0){
            console.log(`Last iteration!`)
            const res = await runInTransaction(dues, Due)
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
 

const runInTransaction = async function(dues, TargetModel) {
    const session = await mongoose.startSession()
    session.startTransaction()

    console.log(dues)

    try {
        const res = await TargetModel.bulkWrite(dues, {session})
        await session.commitTransaction()
        return res
    } catch (error){
        await session.abortTransaction()
        throw error
    } finally {
        session.endSession()
    }
}

router.post('/batchInfo', async (req, res) => {

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

    try {
        const cnt = await Student.countDocuments(match)
        res.send({willAffect: cnt})
    } catch (error) {
        res.status(400).send(error)
    }
})




 
module.exports = router