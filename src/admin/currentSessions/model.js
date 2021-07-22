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
    },
    coursesToOffer: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    }]
}))

module.exports = CurrentSession
