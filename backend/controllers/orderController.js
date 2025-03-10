const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Product = require('../models/productModel')
const mongoose = require('mongoose')

const createOrder = async (req, res) => {
  console.log("Order request body:", req.body);
  const {
    userId,
    items,
    shippingAddress,
    paymentMethod,

    totalPrice,
    couponId,
  } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("No items in the order");
  }

  const order = new Order({
    userId,
    items,
    shippingAddress,
    paymentMethod,

    totalPrice,
    couponId,
  });

  const createdOrder = await order.save();
  console.log("order created")
  res.status(201).json(createdOrder);
};

const getMyOrders = async (req, res) => {
  console.log("uuuuuuuser", req.user._id)
  try {
    const orders = await Order.find({ userId: req.user._id }).populate('items');
    console.log("orders", orders)
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getAllOrders = async (req, res) => {

  try {
    const { searchTerm, status, page = 1, } = req.query;
    console.log(req.query)
    const limit = 6
    let query = {};
    if (searchTerm) {
      query.orderId = { $regex: searchTerm, $options: "i" };

    }

    if (status) {
      query.status = status;
    }



    const skip = (parseInt(page) - 1) * parseInt(limit);
    console.log("Skip:", skip, "Limit:", limit);
    const orders = await Order.find(query)
      .populate("userId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments(query);

    res.json({
      orders,
      currentPage: page,
      pages: Math.ceil(totalOrders / limit),
    });
  } catch (error) {
    console.error("Error Fetching Orders:", error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

const findOrderById = async (req, res) => {

  console.log("Received Order ID:", req.params.id);
  const id = req.params.id
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Order ID" });
    }
    const order = await Order.findById(id).populate(
      "userId")
      .populate("shippingAddress")
      .populate({
        path: "items",
        model: Product,
        select: "name price",
      });
    console.log("orrrrder", order)
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: "Order Not Found" })

    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
};








module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  findOrderById,
}