const mongoose = require('mongoose')

const slotSchema = new mongoose.Schema({

    _id: {
        type: Number,
        alias: 'id'
    },
    startingTime: {
        type: Number, // seconds from midnight
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    }
})


slotSchema.methods.toJSON = function() {
    const slot = this.toObject()
    slot.id = slot._id

    delete slot._id
    delete slot.__v
    
    return slot
}


const Slot = mongoose.model('Slot', slotSchema)



module.exports = Slot