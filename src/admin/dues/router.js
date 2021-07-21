const express = require('express')
const mongoose = require('mongoose')

const {Due, LevelChangingFee, ExamFee, DiningFee} = require('./model')
const {PRIVILEGES} = require('../../utils/constants')
const {adminRequired,hasAllPrivileges,hasAnyPrivileges} = require('../../utils/middlewares')
const {runInTransaction} = require('../../utils/helpers')
const constants = require('../../utils/constants')
const { User, Student } = require('../accounts/model')

const router = new express.Router()

// dept, hall, level, term, ids
router.post('/upsert/', async (req, res) => {
    let match = {}
    const bulkSize = 2
    let cnt = 0, it = 0, totalTime

    try {

        match.hasGraduated = false

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
            // throw new Error("Fail!")
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
 


router.post('/batchInfo', async (req, res) => {

    let match = {}

    match.hasGraduated = false

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

router.post('/getDue', async (req, res) => {
   try{
       let filterParam = {}
       if (!req.body.dueType) {
           throw new Error("Due type not specified!")
       }
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
       if (req.body.ids){
           filterParam.issuedTo = {
               $in: req.body.ids
           }
       }
       // filterParam.status = constants.DUE_STATUS.PENDING
       const dues = await Due.find(filterParam)
       res.send(dues)
   } catch (error){
        res.status(400).send({error: error.message})
   }

})

router.post('/clearDue', async (req, res) => {
    try{
        let filterParam = {}
        if (!req.body.dueType) {
            throw new Error("Due type not specified!")
        }
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
        if (req.body.ids){
            filterParam.issuedTo = {
                $in: req.body.ids
            }
        }
        filterParam.status = constants.DUE_STATUS.PENDING
        const dues = await Due.updateMany(filterParam, {
            $set:{
                status: constants.DUE_STATUS.CLEARED
            }
        })
        res.send({
            modifiedCount: dues.nModified
        })
    } catch (error){
        res.status(400).send({error: error.message})
    }
})

module.exports = router