const mongoose = require('mongoose')
// const validator = require('validator')
const constants = require('../../utils/constants')

const courseSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        alias: 'id'
    },
    courseID: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    offeredByDepartment: {
        type: String,
        required: true,
        trim: true,
        ref: 'Department'
    },
    offeredToDepartment: {
        type: String,
        required: true,
        trim: true,
        ref: 'Department'
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
    prerequisites: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Course'
        }
    ],
    syllabusID: {
        type: String,
        required: true
    },
    description: {
        type: String
    }
})

courseSchema.methods.toJSON = function() {
    const course = this.toObject()

    course.id = course._id

    delete course.__v
    delete course._id

    return course
}

const Course = mongoose.model('Course', courseSchema)

module.exports = Course
