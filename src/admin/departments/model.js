const mongoose = require('mongoose')
const constants = require('../../utils/constants')

const departmentSchema = new mongoose.Schema({
    _id: {
        type: String,
        alias: "code",
    },
    name: {
        type: String,
    },
    head: {
        type: String,
        ref: 'User'
    }
})

departmentSchema.virtual('users', {
    ref: 'User',
    localField: '_id',
    foreignField: 'department'
})

departmentSchema.virtual('students', {
    ref: 'User',
    localField: '_id',
    foreignField: 'department',
    match : {
        userType: constants.USER_TYPES.STUDENT
    }
})

departmentSchema.virtual('teachers', {
    ref: 'User',
    localField: '_id',
    foreignField: 'department',
    match : {
        userType: constants.USER_TYPES.TEACHER
    }
})

const Department = mongoose.model('Department', departmentSchema)

module.exports = Department