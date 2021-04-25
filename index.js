const express = require('express')
require('./db/mongoose')  // connect with the db
const cors = require('cors')

//import admin side routers
const userRouter = require('./src/admin/accounts/router')
const courseRouter = require('./src/admin/courses/router')
const departmentRouter = require('./src/admin/departments/router')
const hallRouter = require('./src/admin/halls/router')
//import teacher side routers


const app = express()
const port = 3000

app.use(express.json())
app.use(cors())
// admin side router registration
app.use(userRouter)
app.use(courseRouter)
app.use(departmentRouter)
app.use(hallRouter)

// teacher side router registration


app.listen(port, () => {
    console.log(`UIIS backend app listening at http://localhost:${port}`)
})
