const mongoose = require('mongoose')
const constants = require('../../utils/constants')

const courseRegistrationSchema = new mongoose.Schema({
    courseSession: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CourseSession',
        required: true
    },
    student: {
        type: String,
        ref: 'User',
        required: true
    },
    level: {
        type: Number,
        // required: true,
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
        // required: true,
        min: constants.MIN_TERM,
        max: constants.MAX_TERM,
        // validate (value) {
        //     if (!value.isInteger)
        //         throw new Error('Term must be Integer')
        // }
    },
    attendanceMarks: [
        {
            teacher: {
                type: String,
                ref: 'User',
                required: true
            },
            mark: {
                type: Number,
                required: true
            }
        }
    ],
    evalMarks: [
        {
            teacher: {
                type: String,
                ref: 'User',
                required: true
            },
            mark: {
                type: Number,
                required: true
            },
            evalID: {
                type: Number,
                required: true
            }
        }
    ],
    termFinalMarks: [
        {
            examiner: {
                type: String,
                ref: 'User',
                required: true
            },
            mark: {
                type: Number,
                required: true
            },
            part: {
                type: String,
                required: true
            }
        }
    ],
    result: {
        gradePoint: {
            type: Number
        },
        gradeLetter: {
            type: String
        },
        percentage: {
            type: Number
        }
    },
    status: {
        type: String,
        enum: ['offered', 'applied', 'registered', 'passed', 'failed']
    }
})

const CourseRegistration = mongoose.model('CourseRegistration', courseRegistrationSchema)

module.exports = CourseRegistration
