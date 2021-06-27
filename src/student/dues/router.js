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

router.get('/test', async (req, res) => {
    try {
        const payment = new SSLCommerzPayment(
            'buet60d7026a407ce',
            'buet60d7026a407ce@ssl'
        )
        console.log(payment)

        const data = await payment.init({
            total_amount: '100',
            currency: 'BDT',
            tran_id: 'uiis'+Math.floor(Math.random()*1000),
            // success_url: 'http://localhost:8081/admin',
            success_url: 'https://uiis-back-end.redwanplague.repl.co/ssl/success',
            fail_url: 'http://localhost:8081/admin',
            cancel_url: 'http://localhost:8081/admin',
            ipn_url: 'https://uiis-back-end.redwanplague.repl.co/ssl/test',
            cus_name: 'Bishwajit',
            cus_email: 'bishwajit@yahoo.com',
            cus_add1: 'Dhaka',
            cus_city: 'Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: '01711111111',
            shipping_method: 'NO',
            product_name: 'Due',
            product_category: 'Due',
            product_profile: 'general'
        })

        res.send(data)

    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router

