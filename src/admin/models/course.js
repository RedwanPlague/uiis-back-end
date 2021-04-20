const mongoose = require('mongoose')
const validator = require('validator')
const constants = require('../constants')

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    credit: {
        type: Number,
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
    preRequisite: [{
        course: {
            type: String,
            required: true
        }
    }],
    description: {
        type: String
    }

}, {
    // timestamps: true
})


const Course = mongoose.model('Course', courseSchema)

module.exports = Course