const express = require('express')

const {SSLCommerzPayment} = require('../../utils/sslcommerz')

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

router.get('/initiate-payment', async (req, res) => {
    try {
        const payment = new SSLCommerzPayment(
            'buet60d7026a407ce',
            'buet60d7026a407ce@ssl'
        )
        let collection = undefined
        if (req.query.type === "due"){
            collection = Due
        } else if (req.query.type === "fine"){
            collection = Fine
        } else {
            throw new Error("Unknown query type!")
        }

        const doc = await collection.findById(req.query.id).populate({
            path: 'issuedTo'
        })

        console.log("due ID " + req.query.id)

        if (!doc){
            throw new Error("No such doc exists!")
        }
        const tran_id = doc._id +Math.floor(Math.random()*1000)
        const data = await payment.init({
            total_amount: doc.currentAmount,
            currency: 'BDT',
            tran_id,
            // success_url: 'http://localhost:8081/admin',
            success_url: 'https://uiis-back-end.redwanplague.repl.co/ssl/success',
            fail_url: 'https://uiis-back-end.redwanplague.repl.co/ssl/fail',
            cancel_url: 'https://uiis-back-end.redwanplague.repl.co/ssl/cancel',
            ipn_url: 'https://uiis-back-end.redwanplague.repl.co/ssl/test',
            cus_name: doc.issuedTo.name,
            cus_email: doc.issuedTo.email || "dummy@gmail.com",
            cus_add1: 'Dhaka',
            cus_city: 'Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: '01711111111',
            shipping_method: 'NO',
            product_name: req.query.type,
            product_category: 'Due',
            product_profile: 'general',
            value_a: req.query.type
        })
        console.log(data)

        if (data.status === "SUCCESS"){
            doc.sessionKey = data.sessionkey
            doc.transactionID = tran_id
            await doc.save()
            console.log(`session key ${doc.sessionKey}`)
            res.send(data.GatewayPageURL)
        }
        else {
            throw new Error(`SSL init failed! reason: ${data.failedreason}`)
        }
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router

