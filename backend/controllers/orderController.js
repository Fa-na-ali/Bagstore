const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Product = require('../models/productModel')
const mongoose = require('mongoose');
const Payment = require('../models/paymentModel');
const Return = require('../models/returnModel');
const STATUS_CODES = require('../statusCodes');
const Wallet = require('../models/wallet');
const Coupon = require('../models/couponModel');
const asyncHandler = require('../middlewares/asyncHandler');

async function generateOrderId() {
  const { nanoid } = await import("nanoid");
  return `ORD-${nanoid(10)}`;
}

const generateOrderNumber = async () => Math.random().toString(36).substring(2, 12).toUpperCase();

//create order
const createOrder = asyncHandler(async (req, res) => {

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const orderId = await generateOrderId();
    const orderNumber = await generateOrderNumber()
    let { userId, items, shippingAddress, shippingPrice, paymentMethod, totalPrice, couponId, razorpay_order_id, paymentStatus, couponDiscount, totalDiscount, tax } = req.body;
    if (!items || items.length === 0) {
      res.status(STATUS_CODES.NOT_FOUND)
      throw new Error("No items in the order");
    }

    const user = await User.findById(userId).session(session)

    if (!user) {
      res.status(STATUS_CODES.NOT_FOUND)
      throw new Error("User not found");
    }

    const validatedItems = [];
    for (const item of items) {
      if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error("Invalid product ID");
      }
      if (!item.qty || item.qty < 1) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error(`Invalid quantity for product ${item.product}`);
      }
      const product = await Product.findById(item.product).session(session);
      if (!product || product.quantity < item.qty) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      product.quantity -= item.qty;
      await product.save({ session });

      validatedItems.push({ product: item.product, qty: item.qty, status: "Pending", discount: item.discount, name: item.name, price: item.price, category: item.category });
    }

    if (paymentMethod === "Cash On Delivery" && totalPrice > 1000) {
      res.status(STATUS_CODES.BAD_REQUEST)
      throw new Error("COD payment is not available for orders above ₹ 1000");
    }
    if (paymentMethod === "Wallet") {
      const wallet = await Wallet.findOne({ userId: user._id });
      if (!wallet || wallet.balance < totalPrice) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error("Insufficient balance in wallet");
      }
      wallet.balance -= totalPrice;
      wallet.transactions.push({
        amount: totalPrice,
        type: "Debit",
        description: `Order Payment - ${orderNumber}`,
      });
      await wallet.save({ session });
    }

    let payment = new Payment({
      userId: user._id,
      method: paymentMethod,
      amount: totalPrice,

    });

    if (paymentMethod === "Razorpay" && razorpay_order_id !== "") {
      payment.razorpay_order_id = razorpay_order_id;
      payment.status = paymentStatus;
    }
    if (paymentMethod == "Wallet") {
      payment.status = "Success";
      paymentStatus = "Success"
    }
    if (!isNaN(couponDiscount)) {
      payment.couponDiscount = couponDiscount;
    }
    await payment.save({session})

    const order = new Order({
      orderId,
      orderNumber,
      userId,
      items: validatedItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "Cash On Delivery" ? "Success" : paymentStatus,
      paymentId: payment._id,
      shippingPrice,
      status: "Not completed",
      totalPrice:totalPrice+shippingPrice,
      couponId,
      couponDiscount,
      totalDiscount,
      tax
    });

    const createdOrder = await order.save({ session });

    if (user.coupon) {
      const coupon = await Coupon.findById(user.coupon);
      if (coupon && !coupon.usedUsers.includes(user._id)) {
        coupon.usedUsers.push(user._id);
        coupon.limit -= 1;
        await coupon.save({ session });
      }

      user.coupon = null;
      await user.save({ session });
    }

    // await Promise.all(
    //   createdOrder.items.map(async (item) => {
    //     const product = await Product.findById(item.product);
    //     if (product) {
    //       product.quantity -= item.qty;
    //       await product.save();
    //     }
    //   })
    // );

    await Payment.updateOne(
      { _id: payment._id },
      { $set: { orderId: createdOrder._id } },
      { session }
    )
  
    await session.commitTransaction();
    session.endSession();
    return res.status(STATUS_CODES.CREATED).json({ status: "success", createdOrder });
  } catch (error) {

    await session.abortTransaction();
    session.endSession();
    res.status(STATUS_CODES.BAD_REQUEST).json({ status: "error", message: error.message });
  }
});


//get my orders
const getMyOrders = asyncHandler(async (req, res) => {

  const filters = { userId: req.user._id };
  const { searchTerm } = req.query;

  if (searchTerm) {
    filters.orderId = searchTerm; `  `
  }
  const orders = await Order.find(filters)
    .populate("items.product")
    .sort({ createdAt: -1 });
  return res.status(STATUS_CODES.OK).json({ status: "success", orders });
});

//cancel order
const cancelOrder = asyncHandler(async (req, res) => {

  const { orderId, item, cancelReason } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(STATUS_CODES.NOT_FOUND)
    throw new Error("User not found");
  }

  const order = await Order.findOne({ _id: orderId, userId: user._id });
  if (!order) {
    res.status(STATUS_CODES.NOT_FOUND)
    throw new Error("Order not found");
  }

  const orderItem = order.items.find((i) => i.product.toString() === item.product._id);
  if (!orderItem) {
    res.status(STATUS_CODES.NOT_FOUND)
    throw new Error("Item not found in order");
  }

  if (orderItem.status !== "Pending") {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error("Order can only be cancelled in pending state");
  }

  const product = await Product.findById(item.product);
  if (product) {
    product.quantity += orderItem.qty;
    await product.save();
  }

  orderItem.status = "Cancelled";
  orderItem.cancel_reason = cancelReason || "Not specified";

  await order.save();
  req.io.emit('orderStatusUpdated', {
    orderId: order._id,
    item: orderItem,
    newStatus: 'Cancelled',
    message: `Order ${order.orderId} was cancelled.`
  });
  const payment = await Payment.findOne({ orderId: order._id });
  if (!payment) {
    res.status(STATUS_CODES.NOT_FOUND)
    throw new Error("Payment not found for this order");
  }
  if (payment.method !== "Cash On Delivery") {

    await Payment.updateOne({ _id: order.paymentId }, { $set: { status: "Refund" } });
    let wallet = await Wallet.findOne({ userId: order.userId });

    if (!wallet) {

      wallet = new Wallet({
        userId: order.userId,
        balance: 0,
        transactions: []
      });
    }

    let refundAmount = item.qty * product.price;
    if (item.discount) {
      refundAmount -= item.discount
    }
    wallet.balance += refundAmount;


    wallet.transactions.push({
      amount: refundAmount,
      type: "Credit",
      description: `Refund for cancelled product: ${product.name} ${order.orderNumber}`
    });

    await wallet.save();
  }

  return res.status(STATUS_CODES.OK).json({
    status: "success",
    message: "Order item cancelled successfully",
  });
});

//get all orders in admin
const getAllOrders = asyncHandler(async (req, res) => {

  const { searchTerm, status, page = 1, } = req.query;
  const limit = 6
  let query = {};
  if (searchTerm) {
    query.orderId = { $regex: searchTerm, $options: "i" };

  }

  if (status) {
    query.status = status;
  }
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const orders = await Order.find(query)
    .populate("userId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalOrders = await Order.countDocuments(query);

  return res.status(STATUS_CODES.OK).json({
    status: "success",
    message: "",
    orders,
    page,
    count: totalOrders,
    pages: Math.ceil(totalOrders / limit),
  });
});

//get order  by id
const findOrderById = asyncHandler(async (req, res) => {

  const id = req.params.id

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error("Invalid Order ID");
  }
  const order = await Order.findById(id).populate(
    "userId")
    .populate("shippingAddress")
    .populate("items.product")
  if (order) {
    return res.status(STATUS_CODES.OK).json({ status: "success", order });
  } else {
    res.status(STATUS_CODES.NOT_FOUND)
    throw new Error("Order Not Found")

  }
});

//set product/item status
const setItemStatus = asyncHandler(async (req, res) => {

  const { status, item, id } = req.body;
  if (status == "Delivered") {
    const payment = await Payment.findOne({ orderId: id });
    if (!payment) {
      res.status(STATUS_CODES.NOT_FOUND)
      throw new Error("Payment not found for this order");
    }

    if (payment.status == "Pending") {
      await Payment.updateOne({ _id: payment._id }, { $set: { status: "Success" } });
    }
  }

  const order = await Order.findOne({ _id: id });

  if (!order) {
    res.status(STATUS_CODES.NOT_FOUND)
    throw new Error("Order not found");
  }

  const orderItem = order.items.find((i) => i.product.toString() === item.product._id);
  if (!orderItem) {
    res.status(STATUS_CODES.NOT_FOUND)
    throw new Error("Item not found in order");
  }

  orderItem.status = status
  const allDelivered = order.items.every((i) => i.status === "Delivered");

  if (allDelivered) {
    order.status = "Completed";
  }
  if (status === "Returned") {
    const product = await Product.findById(item.product);
    if (product) {
      product.quantity += orderItem.qty;
      await product.save();
    }
    let refundAmount;
    if (order?.items?.length === 1) {
      refundAmount = order.totalPrice
    }
    else {
      refundAmount = item.qty * product.price;
      if (item.discount) {
        refundAmount -= item.discount
      }
    }
    await Payment.updateOne({ _id: order.paymentId }, { $set: { status: "Refund" } });
    await Wallet.updateOne({ userId: order.userId }, {
      $push: {
        transactions: {
          type: "Credit",
          amount: refundAmount,
          description: `Refund for returned product: ${product.name} ${order.orderNumber}`
        }
      },
      $inc: {
        balance: refundAmount
      }
    })
  }

  await order.save();
  return res.status(STATUS_CODES.OK).json({ status: "success", message: `Order status updated successfully` });
});

//return order by user
const returnOrder = asyncHandler(async (req, res) => {
  const { orderId, item, returnReason } = req.body;
  const user = await User.findOne({ _id: req.user._id });
  if (!user) {
    res.staus(STATUS_CODES.NOT_FOUND)
    throw new Error(`User not found`);
  }
  const order = await Order.findOne({ _id: orderId, userId: user._id });
  if (!order) {
    res.staus(STATUS_CODES.NOT_FOUND)
    throw new Error(`Order not found`);
  }
  const orderItem = order.items.find((i) => i.product.toString() === item.product._id);
  if (!orderItem) {
    res.staus(STATUS_CODES.NOT_FOUND)
    throw new Error("Item not found in order");
  }
  if (item.status !== "Delivered") {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error("Order can only be returned after delivery");
  }

  const payment = await Payment.findOne({ _id: order.paymentId });
  if (!payment) {
    res.status(STATUS_CODES.NOT_FOUND)
    throw new Error("Payment record not found for this order");
  }
  const exists = await Return.findOne({ orderId: order._id });
  if (exists) {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error("Return request already sent for this order");
  }
  const returnData = new Return({
    userId: user._id,
    orderId: order._id,
    paymentId: payment._id,
    itemId: item._id,
    reason: returnReason,
  });
  await returnData.save();
  orderItem.returnReason = returnReason
  orderItem.status = "Return requested"
  await order.save()
  return res.status(STATUS_CODES.OK).json({ status: "success", message: "Return request sent successfully" });
});

//pending orders
const loadPendingOrder = asyncHandler(async (req, res) => {

  const id = req.params.id
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error("Invalid Order ID");
  }
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ _id: id }).populate(
    "userId")
    .populate("shippingAddress")
    .populate("items.product")
    .skip(skip)
    .limit(limit);

  const totalOrders = await Order.countDocuments({
    userId: userId,
    paymentMethod: "Razorpay",
    paymentStatus: "Pending"

  });

  const totalPages = Math.ceil(totalOrders / limit);

  return res.status(STATUS_CODES.OK).json({
    status: "success",
    orders, page, totalPages
  })
})




module.exports = {
  createOrder,
  cancelOrder,
  getMyOrders,
  returnOrder,
  getAllOrders,
  findOrderById,
  setItemStatus,
  loadPendingOrder,
}