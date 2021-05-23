const express = require('express')

//import admin side routers
const userRouter = require('./accounts/router')
const courseRouter = require('./courses/router')
const departmentRouter = require('./departments/router')
const hallRouter = require('./halls/router')
const courseSessionRouter = require('./courseSessions/router')
const slotRouter = require('./slots/router')

const router = new express.Router()


router.use('/account', userRouter)
router.use('/course', courseRouter)
router.use('/department', departmentRouter)
router.use('/hall', hallRouter)
router.use('/courseSession', courseSessionRouter)
router.use('/slot', slotRouter)

module.exports = router