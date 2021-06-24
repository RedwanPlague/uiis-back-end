const express = require('express')
const mongoose = require('mongoose')

const {Fine} = require('./model')
const {PRIVILEGES} = require('../../utils/constants')
const {adminRequired,hasAllPrivileges,hasAnyPrivileges} = require('../../utils/middlewares')
const constants = require('../../utils/constants')
const { User, Student } = require('../accounts/model')

const router = new express.Router()

router.post('/assign', async (req, res) => {
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

router.get('/list/:studentID', async (req, res)=> {
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

router.post('/clear/:fineID', async (req, res)=> {
    try{
        console.log(req.params.fineID)

        const fine = await Fine.findById(req.params.fineID)
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