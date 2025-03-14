const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      required: true,
      default: "pending",
    },
    method: {
      type: String,
      enum: ["cod", "upi", "wallet", "card"],
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
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
