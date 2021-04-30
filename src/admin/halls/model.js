const mongoose = require('mongoose')

const hallSchema = new mongoose.Schema({
    _id: {
        type: String,
        alias: 'id'
    },
    name: {
        type: String
    },
    provost: {
        type: String,
        ref: 'User'
    }
})

hallSchema.methods.toJSON = function() {
    const hall = this.toObject()

    hall.id = hall._id

    delete hall.__v
    delete hall._id

    return hall
}
const Hall = mongoose.model('Hall', hallSchema)

module.exports = Hall