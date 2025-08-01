const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["Pending", "Success", "Failed", 'Refund'],
      required: true,
      default: "Pending",
    },
    method: {
      type: String,
      enum: ["Cash On Delivery", "Razorpay", "Wallet",],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: false,
    },
    shippingPrice: {
      type: Number,
      required: false,
      default: 0
    },
    couponDiscount: {
      type: Number,
      required: false,
      default: 0
    },
    razorpay_order_id: {
      type: String,
      required: false
    },
    razorpay_payment_id: {
      type: String,
      required: false
    },
    razorpay_signature: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
