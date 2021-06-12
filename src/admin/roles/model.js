const mongoose = require('mongoose')
const constants = require('../../utils/constants')

const roleSchema = new mongoose.Schema({
    _id: {
        type: String,
        alias: 'role'
    },
    privileges: [{
        type: String,
        required: true,
        enum: Object.values(constants.PRIVILEGES)
    }]
})

const Role = mongoose.model('Role', roleSchema)

module.exports = {
    Role
}