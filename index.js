const express = require('express')
const cors = require('cors')

/* connect with the db */
require('./db/mongoose')

const { logInRequired } = require('./src/utils/middlewares')

const adminRouter = require('./src/admin/baseRouter')
const studentRouter = require('./src/student/baseRouter')
const teacherRouter = require('./src/teacher/baseRouter')

const app = express()
const port = 3000

app.use(express.json())
app.use(cors())

app.post('/ssl/test', (req, res) => {
    try {
        console.log('We have arrived at Beauty')
        console.log(req.body)
        res.send(req.body)
    }
    catch (error) {
        res.status(400).send(error)
    }
})

/* admin side router registration */
app.use(adminRouter)
/* student side router registration */
app.use('/student', logInRequired, studentRouter)
/* teacher side router registration */
app.use('/teacher', logInRequired, teacherRouter)

app.listen(port, () => {
    console.log(`UIIS backend app listening at http://localhost:${port}`)
})
