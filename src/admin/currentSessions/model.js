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
    }
}))

module.exports = CurrentSession
