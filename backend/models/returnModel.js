const mongoose = require('mongoose');

const Schema = mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    },
    rejection_reason: {
        type: String,
        required: false
    }
}, {timestamps: {createdAt: "createdAt", updatedAt: "updatedAt"}});

const Return = mongoose.model('Return', productSchema);

module.exports = Return;