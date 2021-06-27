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
            currency: 'EUR',
            tran_id: 'REF123',
            success_url: 'http://yoursite.com/success.php',
            fail_url: 'http://yoursite.com/fail.php',
            cancel_url: 'http://yoursite.com/cancel.php',
            cus_name: 'Customer Name',
            cus_email: 'cust@yahoo.com',
            cus_add1: 'Dhaka',
            cus_add2: 'Dhaka',
            cus_city: 'Dhaka',
            cus_state: 'Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: '01711111111',
            cus_fax: '01711111111',
            ship_name: 'Customer Name',
            ship_add1 : 'Dhaka',
            ship_add2: 'Dhaka',
            ship_city: 'Dhaka',
            ship_state: 'Dhaka',
            ship_postcode: '1000',
            ship_country: 'Bangladesh',
            multi_card_name: 'mastercard,visacard,amexcard',
            value_a: 'ref001_A',
            value_b: 'ref002_B',
            value_c: 'ref003_C',
            value_d: 'ref004_D',
            shipping_method: 'haha',
            product_name: 'haha',
            product_category: 'haha',
            product_profile: 'haha',
        })

        console.log(data)
        res.send(data)

    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router

