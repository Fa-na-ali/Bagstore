const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true },
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
      enum: ["Cash On Delivery", "Wallet", "Razorpay"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed", 'refund'],
      default: "pending",
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
          enum: ['pending', 'delivered', 'cancelled', 'returned', 'shipped', 'return requested'],
          default: 'pending',
        },
        discount: {
          type: Number,
          required: false,
          default: 0
        },
        cancel_reason: {
          type: String,
          required: false
        },
        returnReason: {
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
    couponDiscount: {
      type: Number,
      required: false,
      default: 0
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
