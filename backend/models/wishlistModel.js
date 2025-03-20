const mongoose = require('mongoose');

const Schema = mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    color: {
        type: String,
        required: true
    }
}, {timestamps: {createdAt: "createdAt", updatedAt: "updatedAt"}})

const Wishlist = mongoose.model("Wishlist", Schema);

module.exports = Wishlist;