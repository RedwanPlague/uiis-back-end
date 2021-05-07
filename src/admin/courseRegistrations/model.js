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
        enum: ['applied', 'pending', 'accepted']
    }
})

const CourseRegistration = mongoose.model('CourseRegistration', courseRegistrationSchema)

module.exports = CourseRegistration