const mongoose = require('mongoose')
const validator = require('validator')
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
    timestamps: true
})

userSchema.methods.generateAuthToken = async function(){
    return jwt.sign({_id: this._id.toString()},
        "uiisSecret")
}

const User = mongoose.model('User', userSchema)

module.exports = User