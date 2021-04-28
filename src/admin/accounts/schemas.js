const mongoose = require('mongoose')

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
    }
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