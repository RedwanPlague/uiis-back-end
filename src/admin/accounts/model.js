const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const constants = require('../../utils/constants')
const {studentSchema, teacherSchema, adminSchema} = require('./schemas')



const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        alias: 'id'
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid!')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 3
    },
    privileges: [{
        type: String,
        required: true,
        trim: true,
        enum: Object.values(constants.PRIVILEGES)
    }],
    tokens: [{
        token: {
            type: String,
            require: true
        }
    }]
}, {
    // timestamps: true,
    discriminatorKey: 'userType',
    toJSON : {
        virtuals: true
    }
})

userSchema.methods.generateAuthToken = async function(){
    const token = jwt.sign({
        _id: this._id.toString()
    }, process.env.JSON_WEB_TOKEN)


    return token
}

userSchema.statics.findByCredentials = async  (id, password) => {

    const user = await User.findById(id)

    if (!user){
        throw new Error('Invalid User ID')
    }
    const isMatch = await bcrypt.compare(
        password, user.password
    )
    if (!isMatch){
        throw new Error('Wrong Password')
    }
    return user
}

userSchema.methods.toJSON = function() {
    const user = this.toObject()
    user.id = user._id

    delete user._id
    delete user.__v
    delete user.password
    delete user.tokens

    return user
}

//hash the plain text password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
    }
    next()
})

// userSchema.virtual('department-head', {
//     ref: 'Department',
//     localField: 'userID',
//     foreignField: 'head'
// })

const User = mongoose.model('User', userSchema)
const Student = User.discriminator(constants.USER_TYPES.STUDENT, studentSchema)
const Teacher = User.discriminator(constants.USER_TYPES.TEACHER, teacherSchema)
const Admin = User.discriminator(constants.USER_TYPES.ADMIN, adminSchema)

module.exports = {
    User,
    Student,
    Teacher,
    Admin
}