const express = require('express')
require('./db/mongoose')  // connect with the db

//import admin side routers
const userRouter = require('./admin/routers/user')

//import teacher side routers


const app = express()
const port = 3000

app.use(express.json())
// admin side router registration
app.use(userRouter)

// teacher side router registration


app.listen(port, () => {
    console.log(`UIIS backend app listening at http://localhost:${port}`)
})