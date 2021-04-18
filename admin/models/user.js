const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid!')
            }
        }
    },
    userType: {
        type: String,
        required: true,
        trim: true,
        enum: ['student', 'teacher', 'admin'],
    },
    studentID: {
        type: String,
        required: function () {
            return this.userType === 'student';
        }
    },
    tokens: [{
        token: {
            type: String,
            require: true
        }
    }]
}, {
    timestamps: true,
    strict: false
})

userSchema.methods.generateAuthToken = async function(){
    const token = jwt.sign({
        _id: this._id.toString()
    }, process.env.JSON_WEB_TOKEN)

    this.tokens = this.tokens.concat({ token })
    await this.save()

    return token
}

//hash the plain text password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
    }
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User