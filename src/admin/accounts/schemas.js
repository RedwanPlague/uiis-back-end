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
        required: true,
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
        required: true,
        min: constants.MIN_TERM,
        max: constants.MAX_TERM,
        // validate (value) {
        //     if (!value.isInteger)
        //         throw new Error('Term must be Integer')
        // }
    },
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