const mongoose = require('mongoose');
const crypto = require('crypto');
const cron = require('node-cron');

const Schema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    activation: {
        type: Date,
        required: true
    },
    expiry: {
        type: Date,
        required: true,
    },
    discount: {
        type: Number,
        required: true
    },
    minAmount: {
        type: Number,
        required: true
    },
    maxAmount: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    isExist: {
        type: Boolean,
        default: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['single',]
    },
    limit: {
        type: Number,
        required: true
    },
    coupon_code: {
        type: String,
        unique: true
    },
    users: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    usedUsers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: [],
    }

}, {
    timestamps: true,
}
)

Schema.pre("save", async function (next) {
    if (this.isNew) {
        this.coupon_code = `COUP${crypto.randomBytes(4).toString('hex').toUpperCase()}${String(Date.now()).slice(10)}`;
    }
    next();
})

const Coupon = mongoose.model("Coupon", Schema);

cron.schedule('0 * * * *', async () => {
    try {
        const now = new Date();
        const updated = await Coupon.updateMany(
            { expiry: { $lt: now }, status: true },
            { $set: { status: false } }
        );
    } catch (error) {
        console.error("Error updating expired discounts:", error);
    }
});

module.exports = Coupon;
