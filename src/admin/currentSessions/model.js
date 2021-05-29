const mongoose = require('mongoose')

const CurrentSession = mongoose.model('CurrentSession',  new mongoose.Schema({
    session: {
        type: Date,
        required: true
    }
}))

module.exports = CurrentSession