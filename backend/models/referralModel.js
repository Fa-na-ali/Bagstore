
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
    referralCoupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
        default: null,

    },
    couponUsed:{
        type:Boolean,
        default:false
    },

    referralCode: {
        type: String,
    },
})



module.exports = mongoose.model('Referral', Schema);