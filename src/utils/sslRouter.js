const express = require('express')
const router = new express.Router()

const {Due} = require("../admin/dues/model")
const {Fine} = require("../admin/fines/model")
const constant = require("../utils/constants")

const {SSLCommerzPayment} = require('../utils/sslcommerz/index')
const redirectUrl = ''
const successUrl = ''
const failUrl = ''
const store_id = 'buet60d7026a407ce'
const store_passwd = 'buet60d7026a407ce@ssl'


router.post('/test', async (req, res) => {
    try {
        console.log('We have arrived at IPN')
        console.log(req.body)

        const ssl = new SSLCommerzPayment(
            'buet60d7026a407ce',
            'buet60d7026a407ce@ssl'
        )
        if (req.body.status === "VALID"){
            const type = req.body.value_a
            console.log("Type from ipn : " + type)
            const {val_id, tran_id, amount} = req.body
            console.log(`after destruct : ${val_id} ${tran_id} ${amount}`)

            let collection = undefined
            if (type === "due"){
                collection = Due
            } else if (type === "fine") {
                collection = Fine
            } else {
                console.log(`type does not match!`)
            }
            const doc = await collection.find({
                transactionID : tran_id
            })
            if (doc.currentAmount !== amount) {
                res.status(301).redirect(failUrl)
            }
            const validationRes = await ssl.validate({
                val_id
            })
            console.log(validationRes)

            if (validationRes.status === 'VALID') {
                console.log("transaction successful!")
                doc.status = constant.DUE_STATUS.CLEARED
                await doc.save()
            }
        }
        res.send()
    }
    catch (error) {
        res.status(400).send(error)
    }
})

router.post('/success', async (req, res) => {

    try {
        res.status(301).redirect('https://redwanplague.github.io/hosted-websites/uiis/#/student/dues/status/success')
    }
    catch (error) {
        res.status(400).send(error)
    }
})

router.post('/fail', async (req, res) => {
    try {
        res.status(301).redirect('https://redwanplague.github.io/hosted-websites/uiis/#/student/dues/status/fail')
    }
    catch (error) {
        res.status(400).send(error)
    }
})

router.post('/cancel', async (req, res) => {
    try {
        res.status(301).redirect('https://redwanplague.github.io/hosted-websites/uiis/#/student/dues/status/cancel')
    }
    catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router