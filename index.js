const express = require('express')
const mongoose = require('mongoose');
const app = express()
const port = 3000

mongoose.connect('mongodb+srv://taskapp:!Asswordp20@cluster0.b0dxn.mongodb.net/task-manager-api?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});
const Cat = mongoose.model('Cat', { name: String });


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})