const mongoose = require('mongoose')

const levelChangingFeeSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CurrentSession',
        required: true
    }
})

const diningFeeSchema = new mongoose.Schema({
    yearMonth: {
        type: Date,
        required: true
    }
})

const examFeeSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CurrentSession',
        required: true
    }
})

module.exports = {
    levelChangingFeeSchema,
    diningFeeSchema,
    examFeeSchema
}
