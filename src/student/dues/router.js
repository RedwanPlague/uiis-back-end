const express = require('express')

const constants = require('../../utils/constants')
const { Due } = require('../../admin/dues/model')
const { Fine } = require('../../admin/fines/model')

const router =  express.Router()

router.get('/list', async (req, res) => {
    try {
        if(req.user.userType !== constants.USER_TYPES.STUDENT){
            throw new Error('Only for students!')
        }
        const student = req.user

        const dues = await Due.find({
            issuedTo: student._id,
            status: constants.DUE_STATUS.PENDING
        })

        const fines = await Fine.find({
            issuedTo: student._id,
            status: constants.DUE_STATUS.PENDING
        })
        res.send({dues,fines})       
    } catch (error) {
        res.status(400).send()
    }
})
 

module.exports = router

