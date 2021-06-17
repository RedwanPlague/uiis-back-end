const mongoose = require('mongoose')
 
const constants = require('../../utils/constants')
const {levelChangingFeeSchema, examFeeSche, diningFeeSchema} = require('./schemas')

const dueSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    delayFine: {
        type: Number,
        required: true
    },
    issuedTo: {
        type: String,
        ref: 'User'
    }
}, {
    discriminatorKey: 'dueType',
    toJSON : {
        virtuals: true
    }
})
 
const Due = mongoose.model('Due', userSchema)
const LevelChangingFee = Due.discriminator(constants.DUE_TYPES.LEVEL_CHANGING_FEE, levelChangingFeeSchema)
const DiningFee = Due.discriminator(constants.DUE_TYPES.DINING_FEE, diningFeeSchema)
const ExamFee = Due.discriminator(constants.DUE_TYPES.EXAM_FEE, examFeeSche)

module.exports = {
    Due,
    LevelChangingFee,
    DiningFee,
    ExamFee
}