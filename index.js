const express = require('express')
require('./db/mongoose')  // connect with the db
const cors = require('cors')
const {logInRequired} = require('../../utils/middlewares')

const adminRouter = require('./src/admin/baseRouter')
const teacherRouter = require('./src/teacher/baseRouter')

const app = express()
const port = 3000

app.use(express.json())
app.use(cors())

// admin side router registration
app.use(adminRouter)
// teacher side router registration
app.use('/teacher',logInRequired, teacherRouter)

app.listen(port, () => {
    console.log(`UIIS backend app listening at http://localhost:${port}`)
})
