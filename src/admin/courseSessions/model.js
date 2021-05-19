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
            evalDescriptions: [
                {
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
            day: String, // mon, sun, fri
            room: Number,
            slot: {
                type: Number,
                required: true,
                ref: 'Slot'
            }
        }
    ],
    resultAccessHolders: [
        {
            teacher: {
                type: String,
                required: true,
                ref: 'User'
            }
        }
    ],
    examiners: [
        {
            part: String, // [ Section A / B ] Multiple entries of a single part is allowed [ We might, but we wont ]
            totalMarks: Number,
            teacher: {
                type: String,
                required: true,
                ref: 'User'
            },
            resultEditAccess: Boolean
        }
    ],
    scrutinizers: [
        {
            teacher: {
                type: String,
                required: true,
                ref: 'User'
            },
            hasApprovedResult: Boolean
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
const slotSchema = new mongoose.Schema({

    _id: {
        type: Number,
        alias: 'id'
    },
    startingTime: {
        type: Number, // seconds from midnight
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    }
})


courseSessionSchema.index({ 'course': 1, 'session': 1}, { 'unique': true })


const CourseSession = mongoose.model('CourseSession', courseSessionSchema)
const Slot = mongoose.model('Slot', slotSchema)

module.exports = {
    CourseSession,
    Slot
}
