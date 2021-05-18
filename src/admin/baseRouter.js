const express = require('express')

//import admin side routers
const userRouter = require('./accounts/router')
const courseRouter = require('./courses/router')
const departmentRouter = require('./departments/router')
const hallRouter = require('./halls/router')

const router = new express.Router()


router.use('/account', userRouter)
router.use('/courses', courseRouter)
router.use('/department', departmentRouter)
router.use('/hall', hallRouter)

module.exports = router