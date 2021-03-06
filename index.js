const express = require('express')
const cors = require('cors')

/* connect with the db */
require('./db/mongoose')

const { logInRequired } = require('./src/utils/middlewares')

const adminRouter = require('./src/admin/baseRouter')
const studentRouter = require('./src/student/baseRouter')
const teacherRouter = require('./src/teacher/baseRouter')
const sslRouter = require('./src/utils/sslRouter')

const app = express()
const port = 3000

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())

app.use('/ssl', sslRouter)
/* admin side router registration */
app.use(adminRouter)
/* student side router registration */
app.use('/student', logInRequired, studentRouter)
/* teacher side router registration */
app.use('/teacher', logInRequired, teacherRouter)

app.listen(port, () => {
    console.log(`UIIS backend app listening at http://localhost:${port}`)
})
