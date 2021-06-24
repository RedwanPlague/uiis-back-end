const express = require('express')
const mongoose = require('mongoose')

const {Fine} = require('./model')
const {PRIVILEGES} = require('../../utils/constants')
const {adminRequired, hasFinePrivilege, hasAllPrivileges} = require('../../utils/middlewares')
const constants = require('../../utils/constants')
const { User, Student } = require('../accounts/model')

const router = new express.Router()

router.post('/assign', hasFinePrivilege, async (req, res) => {
    try{
        if (!req.body.ids) {
            throw new Error("Provide ids of the students!")
        }
        const ids = req.body.ids
        let body = req.body
        delete body.ids

        await Promise.all(ids.map(async (id)=> {
            const fine = new Fine({
                issuedTo: id,
                issueDate: Date.now(),
                ...body
            })
            await fine.save()
        }))
        res.status(201).send()
    }catch (error){
        res.status(400).send({error: error.message})
    }
})

router.get('/list/:studentID', adminRequired, async (req, res)=> {
    try{
        console.log(req.params.studentID)
        const fines = await Fine.find({
                status: constants.DUE_STATUS.PENDING,
                issuedTo: req.params.studentID
            }
        )
        res.send(fines)
    }catch (error){
        res.status(400).send({error: error.message})
    }
})

router.post('/clear/:fineID',
    async (req, res)=> {
    try{
        const fine = await Fine.findById(req.params.fineID)

        let privilege = undefined
        if (fine.fineType === constants.FINE_TYPES.LIBRARY_FINE){
            privilege = constants.PRIVILEGES.LIBRARY_FINE_MANAGEMENT
        }
        else if (fine.fineType === constants.FINE_TYPES.LAB_FINE) {
            privilege = constants.PRIVILEGES.LAB_FINE_MANAGEMENT
        }
        else if (fine.fineType === constants.FINE_TYPES.DISCIPLINARY_FINE) {
            privilege = constants.PRIVILEGES.DISCIPLINARY_FINE_MANAGEMENT
        }

        if (req.mergedPrivileges.indexOf(privilege) < 0) {
            throw new Error("Permission Denied!")
        }

        if (!fine){
            throw new Error("No such fine exists!")
        }
        fine.status = constants.DUE_STATUS.CLEARED
        await fine.save()
        res.send(fine)
    }catch (error){
        res.status(400).send({error: error.message})
    }
})
module.exports = router