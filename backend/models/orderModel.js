const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true  },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',

    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash On Delivery", "Wallet", "PayPal"],
      required: true,
    },
    status: {
      type: String,
      enum: ['completed', 'not completed'],
      default: 'not completed',
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        qty: {
          type: Number,
          required: true,
          min: 1,
        },
        status: {
          type: String,
          enum: ['pending', 'delivered', 'cancelled','returned','shipped'],
          default: 'pending',
        },
        cancel_reason: {
          type: String,
          required: false
      }
      },
    ],
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model('Order', orderSchema);
