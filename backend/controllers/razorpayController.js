const razorpay = require('../utils/razorpay');
const Razorpay = require('razorpay');
const Order = require('../models/orderModel');
const dotenv = require('dotenv');
const crypto = require('crypto');
const Payment = require('../models/paymentModel');
const STATUS_CODES = require("../statusCodes");
const asyncHandler = require('../middlewares/asyncHandler');

dotenv.config();
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

//create payment
const createPayment = asyncHandler(async (req, res) => {

  const { amount } = req.body;
  const user_id = req.user._id;
  const options = {
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: `receipt_${user_id}_${Date.now().toString().slice(-5)}`,
  }

  const order = await razorpay.orders.create(options);
  return res.status(STATUS_CODES.OK).json({
    status: "success",
    order: { key: RAZORPAY_KEY_ID, ...order },
  });
});

//verify payment
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature === razorpay_signature) {
    return res.status(STATUS_CODES.OK).json({
      status: "success",
      message: "Payment verified successfully",
    });
  } else {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error("Payment verification failed")
  }
});

//retry payment
const retryPayment = asyncHandler(async (req, res) => {

  const { orderId } = req.body;

  const [orderIdValue, orderNumber] = orderId.split(",");

  const existingOrder = await Order.findById(orderIdValue);

  if (!existingOrder) {
    res.status(STATUS_CODES.NOT_FOUND)
    throw new Error("Order not found")
  }

  const amount = existingOrder.totalPrice ? Math.round(existingOrder.totalPrice * 100) : 0;

  if (!amount || amount <= 0) {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error("Invalid order amount")
  }
  const razorpayOrder = await instance.orders.create({
    amount: amount,
    currency: "INR",
    receipt: `retry_${orderNumber}`,
    payment_capture: 1,
  });

  res.status(STATUS_CODES.OK).json({
    status: "success",
    orderId: orderIdValue,
    orderNumber: orderNumber,
    order: {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    }
  });
});


const setPaymentStatus = asyncHandler(async (req, res) => {
  const { id, status } = req.body;
  const payment = await Payment.updateOne({ _id: id }, { status: status });
  return res.status(STATUS_CODES.OK).json({
    status: "success",
    message: "Payment status updated", order_id: id
  });
});

const verifyRetryPayment = asyncHandler(async (req, res) => {

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  if (!process.env.RAZORPAY_KEY_SECRET) {
    console.error("Razorpay Key Secret is missing!");
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR)
    throw new Error("Server error: Missing Razorpay credentials.")
  }

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error("Invalid payment signature.")
  }

  await Order.findOneAndUpdate(
    { _id: orderId },
    { $set: { paymentStatus: "Success", paymentMethod: "Razorpay" } }
  );

  res.status(STATUS_CODES.OK).json({ status: "success", message: "Payment verified successfully." });
});

module.exports = {
  createPayment,
  verifyPayment,
  retryPayment,
  setPaymentStatus,
  verifyRetryPayment,
}