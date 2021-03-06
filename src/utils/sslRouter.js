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

        const ssl = new SSLCommerzPayment(
            'buet60d7026a407ce',
            'buet60d7026a407ce@ssl'
        )
        if (req.body.status === "VALID"){
            const type = req.body.value_a
            // console.log("Type from ipn : " + type)
            const {val_id, tran_id, amount} = req.body
            // console.log(`after destruct : ${val_id} ${tran_id} ${amount}`)

            let doc
            if (type === "due"){
                doc = await Due.findOne({
                    transactionID : tran_id
                })
            } else if (type === "fine") {
                doc = await Fine.findOne({
                    transactionID : tran_id
                })
            } else {
                console.log(`type does not match!`)
            }
            // console.log("document " + doc)
            // console.log(doc.currentAmount)

            // if (doc.currentAmount !== amount) {
            //     throw new Error("amount does not match")
            // }
            // const validationRes = await ssl.validate({
            //     val_id
            // })
            // console.log(validationRes)

            console.log("transaction successful!")
            doc.status = constant.DUE_STATUS.CLEARED
            console.log(doc)
            await doc.save()
        }
        res.status(200).send()
    }
    catch (error) {
        console.log('error ...')
        console.log(error.message)
        res.status(400).send(error)
    }
})

router.post('/success', async (req, res) => {

    try {
        res.status(301).redirect('https://redwanplague.github.io/hosted-websites/uiis/#/student/dues/status/success?txid='+req.body.tran_id)
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