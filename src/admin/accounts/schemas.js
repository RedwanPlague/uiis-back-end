const mongoose = require('mongoose')
const constants = require('../../utils/constants')

const studentSchema = new mongoose.Schema({
    department: {
        type: String,
        ref: 'Department',
        required: true
    },
    hall: {
        type: String,
        ref: 'Hall',
        required: true
    },
    advisor: {
        type: String,
        ref: 'User',
        required: true
    },
    level: {
        type: Number,
        default: 1,
        min: constants.MIN_LEVEL,
        max: constants.MAX_LEVEL,
        // validate (value) {
        //     console.log(value)
        //     console.log(typeof(value))
        //     if (!value.isInteger)
        //         throw new Error('Level must be Integer')
        // }
    },
    term: {
        type: Number,
        default: 1,
        min: constants.MIN_TERM,
        max: constants.MAX_TERM,
        // validate (value) {
        //     if (!value.isInteger)
        //         throw new Error('Term must be Integer')
        // }
    },
    status: {
        type: String,
        enum: ['unregistered', 'applied', 'waiting', 'registered'],
        default: 'unregistered'
    },
    registrationList: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CourseRegistration'
        }
    ],
    isThesisCleared: {
        type: Boolean,
        default: false
    },
    hasAppliedForClearance: {
        type: Boolean,
        default: false
    },
    results: [{
        totalCreditHoursCompleted: {
            type: Number,
            default: 0.0
        },
        cgpa: {
            type: Number,
            default: 0.0
        }
    }]
})

const teacherSchema = new mongoose.Schema({
    department: {
        type: String,
        ref: 'Department',
        required: true
    }
})

const adminSchema = new mongoose.Schema({
    designation: {
        type: String,
        trim: true
    }
})

module.exports = {
    studentSchema,
    teacherSchema,
    adminSchema
}
