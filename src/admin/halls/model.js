const mongoose = require('mongoose')

const hallSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    provost: {
        type: String
    }
})

const Hall = mongoose.model('Hall', hallSchema)

module.exports = Hall