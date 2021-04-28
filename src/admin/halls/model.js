const mongoose = require('mongoose')

const hallSchema = new mongoose.Schema({
    _id: {
        type: String,
        alias: 'code'
    },
    name: {
        type: String
    },
    provost: {
        type: String,
        ref: 'User'
    }
})

const Hall = mongoose.model('Hall', hallSchema)

module.exports = Hall