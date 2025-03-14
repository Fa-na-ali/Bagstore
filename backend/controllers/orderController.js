const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Product = require('../models/productModel')
const mongoose = require('mongoose')

async function generateOrderId() {
  const { nanoid } = await import("nanoid");
  return `ORD-${nanoid(10)}`;
}
//create order
const createOrder = async (req, res) => {
  console.log("Order request body:", req.body);
  const orderId = await generateOrderId();
  const {
    userId,
    items,
    shippingAddress,
    paymentMethod,

    totalPrice,
    couponId,
  } = req.body;

  if (!items || items.length === 0) {
    res.status(400).json({ message: "No items in the order" })

  }
  const validatedItems = items.map((item) => {
    if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
      throw new Error('Each item must have a valid product ID');
    }
    if (!item.qty || item.qty < 1) {
      throw new Error(`Invalid quantity for product ${item.product}`);
    }
    return { product: item.product, qty: item.qty };
  });

  const order = new Order({
    orderId,
    userId,
    items: validatedItems,
    shippingAddress,
    paymentMethod,
    status:'not completed',
    totalPrice,
    couponId,
  });

  const createdOrder = await order.save();
  console.log("order created")
  if (paymentMethod === "COD") {
    await Promise.all(
      validatedItems.map(async (item) => {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock -= item.qty;
          await product.save();
        }
      })
    );
    console.log("Stock updated for COD order");
  }
  res.status(201).json(createdOrder);
};

//get my orders
const getMyOrders = async (req, res) => {
  console.log("uuuuuuuser", req.user._id)
  try {
    const orders = await Order.find({ userId: req.user._id }).populate('items.product');
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

//get order  by id
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
      .populate("items.product")

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