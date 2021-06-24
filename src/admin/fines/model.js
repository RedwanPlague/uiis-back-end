const mongoose = require('mongoose')
const constants = require('../../utils/constants')

const fineSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    issueDate: {
        type: Date,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    delayFine: {
        type: Number,
        required: true
    },
    issuedTo: {
        type: String,
        ref: 'User'
    },
    status: {
        type: String,
        default: constants.DUE_STATUS.PENDING,
        enum: Object.values(constants.DUE_STATUS)
    },
    fineType: {
        type: String,
        required: true,
        enum: Object.values(constants.FINE_TYPES)
    },
    description: {
        type: String,
        required: true
    }
}, {
    toJSON : {
        virtuals: true
    }
})

const _MS_PER_DAY = 1000 * 60 * 60 * 24;

// a and b are javascript Date objects
function dateDiffInDays(a, b) {
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

fineSchema.virtual('currentDue').get(function (){
    if (this.fineType === constants.FINE_TYPES.LIBRARY_FINE){
        let amount = this.amount
        if (Date.now() > this.deadline){
            amount += dateDiffInDays(this.deadline, new Date()) * this.delayFine;
        }
        return amount
    } else {
        return this.amount +
            (Date.now() > this.deadline) * this.delayFine;
    }
})

const Fine = mongoose.model('Fine', fineSchema)

module.exports = {
    Fine
}
