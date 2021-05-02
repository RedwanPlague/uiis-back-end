const mongoose = require('mongoose')
const constants = require('../../utils/constants')

const courseSessionSchema = new mongoose.Schema({

    courseID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    session: {
        type: String,
        required: true
    },
    perEvalWeight: {
        type: Number,
        required: true
    },
    totalEvalCount: {
        type: Number
    },
    consideredEvalCount: Number,
    attendanceWeight: float(percentage),
    totalMarks: float,

    internal: string(teacherID),

    teachers: [
        {
            part: string,
            teacher: string(ID),
            evalCount: int,
        }
    ],

    schedule: [
        {
            day: string, // mon, sun, fri
            time: time,
            duration: time,
            room: string
        }
    ],

    examiners: [
        {
            part: string,
            teacher: string(ID),
            marks: float
        }
    ],

    scrutinizers: [teacher:string(ID)]
})
