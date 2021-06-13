const express = require('express')

//import admin side routers
const userRouter = require('./accounts/router')
const courseRouter = require('./courses/router')
const departmentRouter = require('./departments/router')
const hallRouter = require('./halls/router')
const courseSessionRouter = require('./courseSessions/router')
const slotRouter = require('./slots/router')
const courseRegistrationRouter = require('./courseRegistrations/router')
const currentSessionRouter = require('./currentSessions/router')
const roleRouter = require('./roles/router')
const {logInRequired} = require('../utils/middlewares')
const {addMergePrivileges} = require('../utils/helpers')

const {User} = require('./accounts/model')

const router = new express.Router()

router.post('/account/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(
            req.body.id,
            req.body.password
        )
        const token = await user.generateAuthToken()
        user.tokens = user.tokens.concat({ token })

        await user.save()
        req.user = user

        addMergePrivileges(req, res)

        res.send({
            user,
            token,
            mergedPrivileges: req.mergedPrivileges
        })
    } catch (error) {
        res.status(400).send({error: error.message})
    }
})


router.use(logInRequired)

router.use('/account', userRouter)
router.use('/course', courseRouter)
router.use('/department', departmentRouter)
router.use('/hall', hallRouter)
router.use('/courseSession', courseSessionRouter)
router.use('/slot', slotRouter)
router.use('/courseRegistration', courseRegistrationRouter)
router.use('/currentSession', currentSessionRouter)
router.use('/role', roleRouter)

module.exports = router