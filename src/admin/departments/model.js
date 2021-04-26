const mongoose = require('mongoose')

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    head: {
        type: String,
        ref: 'User'
    }
})

departmentSchema.virtual('teachers', {
    ref: 'User',
    localField: 'name',
    foreignField: 'department'
})

const Department = mongoose.model('Department', departmentSchema)

module.exports = Department