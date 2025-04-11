
const mongoose = require('mongoose');

const Schema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    referredUsers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: [],
    },
    referralCode: {
        type: String,
    },
    amountEarned: {
        type: Number,
        default: 0
    },
})



module.exports = mongoose.model('Referral', Schema);