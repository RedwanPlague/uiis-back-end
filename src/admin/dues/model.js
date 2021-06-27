const mongoose = require('mongoose')
 
const constants = require('../../utils/constants')
const {levelChangingFeeSchema, examFeeSche, diningFeeSchema, examFeeSchema} = require('./schemas')

const dueSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    issueDate: {
        type: Date,
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
    },
    level: {
        type: Number,
        required: true
    },
    term: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: constants.DUE_STATUS.PENDING,
        enum: Object.values(constants.DUE_STATUS)
    },
    transactionID: {
        type: String
    },
    sessionKey: {
        type: String
    }
}, {
    discriminatorKey: 'dueType',
    toJSON : {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
})

dueSchema.virtual('currentAmount').get(function (){
    return this.amount +
        (Date.now() > this.deadline) * this.delayFine;
})

const Due = mongoose.model('Due', dueSchema)
const LevelChangingFee = Due.discriminator(constants.DUE_TYPES.LEVEL_CHANGING_FEE, levelChangingFeeSchema)
const DiningFee = Due.discriminator(constants.DUE_TYPES.DINING_FEE, diningFeeSchema)
const ExamFee = Due.discriminator(constants.DUE_TYPES.EXAM_FEE, examFeeSchema)


module.exports = {
    Due,
    LevelChangingFee,
    DiningFee,
    ExamFee
}