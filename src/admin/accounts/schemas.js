const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    hall: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hall',
        required: true
    },
    advisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

const teacherSchema = new mongoose.Schema({
    department: {
        type: mongoose.Schema.Types.ObjectId,
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