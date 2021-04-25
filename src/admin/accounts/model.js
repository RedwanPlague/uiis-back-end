const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const constants = require('../../utils/constants')


const userSchema = new mongoose.Schema({
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
    userType: {
        type: String,
        required: true,
        trim: true,
        enum: Object.values(constants.USER_TYPES),
    },
    userID: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 3
    },
    department: {
        type: String,
        ref: 'Department',
        required: function (){
            return this.userType === constants.USER_TYPES.STUDENT ||
                 this.userType === constants.USER_TYPES.TEACHER
        }
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
    strict: false
})

userSchema.methods.generateAuthToken = async function(){
    const token = jwt.sign({
        _id: this._id.toString()
    }, process.env.JSON_WEB_TOKEN)


    return token
}

userSchema.statics.findByCredentials = async  (userID, password) => {
    const user = await User.findOne({userID});

    if (!user){
        throw new Error('Unable to logIn!')
    }
    const isMatch = await bcrypt.compare(
        password, user.password
    )
    if (!isMatch){
        throw new Error('Unable to login')
    }
    return user
}


userSchema.methods.toJSON = function() {
    const user = this.toObject()

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

module.exports = User