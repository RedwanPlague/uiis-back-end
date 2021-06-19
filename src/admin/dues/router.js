
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

    try {
        let dues = []
        let cnt = 0, it = 0, totalTime
        const startTime = Date.now()
        const cursor = await Student.find(match).cursor()

        await cursor.eachAsync(async function (student) {
            const due = new LevelChangingFee({
                amount: (student._id === "1605010")?undefined: req.body.amount,
                issueDate: Date.now(),
                deadline: req.body.deadline,
                delayFine: req.body.delayFine,
                issuedTo: student.id,
                level: student.level,
                term: student.term,
                dueType: req.body.dueType,
                session: req.body.session
            })

            dues.push(due)

            if (dues.length === bulkSize) {
                // console.log(dues[1])

                it++
                console.log(`Iteration No ${it}`)
                cnt += dues.length
                await LevelChangingFee.insertMany(dues)
                dues = []
            }
        })

        if (dues.length > 0){
            console.log(`Last iteration!`)
            cnt += dues.length
            await LevelChangingFee.insertMany(dues)
            dues = []
        }
        totalTime = (Date.now() - startTime)
        console.log(`Inserted ${cnt} elements in ${totalTime} ms`)

        res.status(201).send()

    } catch (error) {
        const cursor = await Student.find(match).cursor()
        let stIds = []
        await cursor.eachAsync(async (student) => {
            stIds.push(student._id)

            if (stIds.length === 1000) {
                await Due.deleteMany({
                    session: new Date(req.body.session),
                    issuedTo: {
                        $in : stIds
                    }
                })
                stIds = []
            }
        })

        console.log(stIds)

        if (stIds.length > 0) {
            const dues = await Due.find({
                session: new Date(req.body.session),
                issuedTo: {
                    $in : stIds
                }
            })
            console.log(dues)

            await Due.deleteMany({
                session: new Date(req.body.session),
                issuedTo: {
                    $in : stIds
                }
            })
            console.log("Successfully Rolled-back!")
        }
        console.log("Successfully Rolled-back!")

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