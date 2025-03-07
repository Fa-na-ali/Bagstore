const mongoose = require('mongoose');

async function generateOrderId() {
  const { nanoid } = await import("nanoid");
  return `ORD-${nanoid(10)}`;
}

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, default: async () => await generateOrderId()  },
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
      enum: ['pending', 'delivered', 'cancelled'],
      default: 'pending',
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Order', orderSchema);
