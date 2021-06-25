const express = require('express')
const mongoose = require('mongoose')

const {Fine} = require('./model')
const {adminRequired, hasFinePrivilege, failIfAdminDoesNotHaveFinePrivilege} = require('../../utils/middlewares')
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
        let allowedType = []
        if (req.mergedPrivileges.indexOf(constants.PRIVILEGES.LAB_FINE_MANAGEMENT) >= 0) {
            allowedType.push(constants.FINE_TYPES.LAB_FINE)
        }
        if (req.mergedPrivileges.indexOf(constants.PRIVILEGES.LIBRARY_FINE_MANAGEMENT) >= 0) {
            allowedType.push(constants.FINE_TYPES.LIBRARY_FINE)
        }
        if (req.mergedPrivileges.indexOf(constants.PRIVILEGES.DISCIPLINARY_FINE_MANAGEMENT) >= 0) {
            allowedType.push(constants.FINE_TYPES.DISCIPLINARY_FINE)
        }

        const fines = await Fine.find({
                // status: constants.DUE_STATUS.PENDING,
                fineType: {
                    $in : allowedType
                },
                issuedTo: req.params.studentID
            }
        )
        res.send(fines)
    }catch (error){
        res.status(400).send({error: error.message})
    }
})

router.get('/get/:fineID', async (req, res) => {
    try {
        const fine = await Fine.findById(req.params.fineID)
        if (!fine){
            throw new Error("No such fine exists!")
        }
        failIfAdminDoesNotHaveFinePrivilege(req, fine)
        res.send(fine)
    } catch (error) {
        res.status(400).send({error: error.message})
    }

})


router.post('/update/:fineID', async (req, res) => {
    try {
        const fine = await Fine.findById(req.params.fineID)
        if (!fine){
            throw new Error("No such fine exists!")
        }

        failIfAdminDoesNotHaveFinePrivilege(req, fine)

        const updates = Object.keys(req.body)

        updates.forEach((update) => {
            if (update !== 'prerequisites') {
                fine.set(update, req.body[update])
            }
        })
        await fine.save()
        res.send(fine)
    } catch (error) {
        res.status(400).send({error: error.message})
    }

})

router.post('/clear', async (req, res)=> {
    try{
        if (!req.body.ids) {
            throw new Error("Provide fine IDS!")
        }

        const fines = await Fine.find({
            _id : {
                $in : req.body.ids
            }
        })

        await Promise.all(fines.map(async (fine) =>{
            failIfAdminDoesNotHaveFinePrivilege(req, fine)
            fine.status = constants.DUE_STATUS.CLEARED
            await fine.save()
        }))

        res.send()
    }catch (error){
        res.status(400).send({error: error.message})
    }
})
module.exports = router