const mongoose = require('mongoose')

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    head: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

departmentSchema.virtual('users', {
    ref: 'User',
    localField: '_id',
    foreignField: 'department'
})


const Department = mongoose.model('Department', departmentSchema)

module.exports = Department