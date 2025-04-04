const razorpay = require('../utils/razorpay');
const dotenv = require('dotenv');
const crypto = require('crypto');
const Payment = require('../models/paymentModel');
const STATUS_CODES  = require("../middlewares/statusCodes");

dotenv.config();
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;

//create payment
const createPayment = async (req, res) => {
    try {
        const { amount } = req.body;
        const user_id = req.user._id;
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${user_id}_${Date.now().toString().slice(-5)}`,
        }

        const order = await razorpay.orders.create(options);
        return res.status(STATUS_CODES.OK).json({
            status:"success",
            order: {key: RAZORPAY_KEY_ID, ...order},
        });
    } catch (err) {
        console.error("Error creating Razorpay order:", err);
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status:"error", 
            message: "Payment failed"});
    }

};

//verify payment
const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
    const generated_signature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");
  
    if (generated_signature === razorpay_signature) {
      return res.status(STATUS_CODES.OK).json({
        status:"success",
        message: "Payment verified successfully",
      });
    } else {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        status:"error", 
        message: "Payment verification failed",
      });
    }
};


//retry payment
const retryPayment = async (req, res) => {
    const { order_id } = req.body;
    if (!order_id) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ 
        status:"error", 
        message: "Invalid request" });
    }
    const order = await razorpay.orders.fetch(order_id);
    return res.status(STATUS_CODES.OK).json({
        status:"success",
      order: { key: RAZORPAY_KEY_ID, ...order },
    });
  };

  const setPaymentStatus = async (req, res) => {
    const { id, status} = req.body;
    const payment = await Payment.updateOne({_id: id}, {status: status});
    return res.status(STATUS_CODES.OK).json({ 
        status:"success",
        message: "Payment status updated", order_id: id
    });
  };

  module.exports = {
    createPayment,
    verifyPayment,
    retryPayment,
    setPaymentStatus,
  }