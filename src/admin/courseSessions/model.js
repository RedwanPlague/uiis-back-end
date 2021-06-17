const mongoose = require('mongoose')
const constants = require('../../utils/constants')


// consideredEvalCount needs validation
const courseSessionSchema = new mongoose.Schema({

    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    session: {
        type: Date, // starting date
        required: true
    },
    status: {
        type: String,
        enum: Object.values(constants.RESULT_STATUS),
        default: constants.RESULT_STATUS.EXAMINER
    },
    perEvalWeight: {
        type: Number   // percentage
    },
    totalEvalCount: {
        type: Number
    },
    consideredEvalCount: {
        type: Number
    },
    attendanceWeight: {
        type: Number   // percentage
    },
    totalMarks: {
        type: Number
    },
    teachers: [
        {
            _id: false,
            teacher: {
                type: String,
                required: true,
                ref: 'User',
            },
            evalCount: {
                type: Number,
                required: true
            },
            classCount: {
                type: Number,
                default: 0
            },
            hasForwarded: {
                type: Boolean,
                default: false
            },
            evalDescriptions: [
                {
                    _id: false,
                    evalID: {
                        type: Number,
                        required: true
                    },
                    totalMarks: {
                        type: Number,
                        required: true
                    }
                }
            ]
        }
    ],
    schedule: [
        {
            _id: false,
            day: String, // mon, sun, fri
            room: String,
            slot: {
                type: Number,
                required: true,
                ref: 'Slot'
            }
        }
    ],
    resultAccessHolders: [
        {
            _id: false,
            teacher: {
                type: String,
                required: true,
                ref: 'User'
            }
        }
    ],
    examiners: [
        {
            _id: false,
            part: String, // [ Section A / B ] Multiple entries of a single part is allowed [ We might, but we wont ]
            totalMarks: Number,
            teacher: {
                type: String,
                required: true,
                ref: 'User'
            },
            hasForwarded: {
                type: Boolean,
                default: false
            }
        }
    ],
    scrutinizers: [
        {
            _id: false,
            teacher: {
                type: String,
                required: true,
                ref: 'User'
            },
            hasForwarded: {
                type: Boolean,
                default: false
            }
        }
    ],
    registrationList: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CourseRegistration'
        }
    ]
})

// starting time needs validation

courseSessionSchema.index({ 'course': 1, 'session': 1}, { 'unique': true })


const CourseSession = mongoose.model('CourseSession', courseSessionSchema)

module.exports = {
    CourseSession
}
