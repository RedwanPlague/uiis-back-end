const mongoose = require('mongoose')

const CurrentSession = mongoose.model('CurrentSession',  new mongoose.Schema({
    session: {
        type: Date,
        required: true
    },
    minimumCreditHourRequired: {
        type: Number,
        default: 3.00,
        required: true
    },
    isRegistrationPeriodRunning: {
        type: Boolean,
        default: true,
        required: true
    },
    eco: {
        type: String,
        required: true,
        ref: 'User',
    },
    resultPublished: {
        type: Boolean,
        default: false,
    }
}))

module.exports = CurrentSession
