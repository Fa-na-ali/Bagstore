const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Product = require('../models/productModel')
const mongoose = require('mongoose');
const Payment = require('../models/paymentModel');
const Return = require('../models/returnModel');
const STATUS_CODES = require('../middlewares/statusCodes');

async function generateOrderId() {
  const { nanoid } = await import("nanoid");
  return `ORD-${nanoid(10)}`;
}
//create order
const createOrder = async (req, res) => {
  try {
    console.log("Order request body:", req.body);
    const orderId = await generateOrderId();
    const { userId, items, shippingAddress, paymentMethod, totalPrice, couponId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in the order" });
    }

    const user = await User.findById(userId);
    console.log("user", user)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const validatedItems = [];
    for (const item of items) {
      if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
        console.log("Invalid product ID:", item.product);
        return res.status(400).json({ status: "error", message: "Invalid product ID" });
      }
      if (!item.qty || item.qty < 1) {
        console.log("Invalid quantity:", item.qty);
        return res.status(400).json({ status: "error", message: `Invalid quantity for product ${item.product}` });
      }
      validatedItems.push({ product: item.product, qty: item.qty, status: "pending" });
    }
    console.log("Validated Items:", validatedItems);

   // if (paymentMethod === "Cash On Delivery" && totalPrice > 1000) {
    //  return res.json({ message: "COD payment is not available for orders above ₹ 1000" });
    //}
    console.log("validated", validatedItems)

    const order = new Order({
      orderId,
      userId,
      items: validatedItems,
      shippingAddress,
      paymentMethod,
      status: "not completed",
      totalPrice,
      couponId,
    });

    const createdOrder = await order.save();
    console.log("Order created successfully", createdOrder);

    const payment = new Payment({
      userId: user._id,
      method: paymentMethod,
      amount: totalPrice,
      orderId: createdOrder._id,
    });

    const createdPayment = await payment.save();
    console.log("Payment recorded successfully");

    createdOrder.paymentId = createdPayment._id;
    await createdOrder.save();

    console.log("Order updated with paymentId");


    if (paymentMethod === "Cash On Delivery") {
      await Promise.all(
        createdOrder.items.map(async (item) => {
          const product = await Product.findById(item.product);
          if (product) {
            console.log(`Before Update - Product: ${product._id}, Stock: ${product.quantity}`);
            product.quantity -= item.qty;
            await product.save();
            console.log(`After Update - Product: ${product._id}, Stock: ${product.quantity}`);
          } else {
            console.log(`Product not found: ${item.product}`);
          }
        })
      );
      console.log("Stock updated for COD order");
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: error.message });
  }
};


//get my orders
const getMyOrders = async (req, res) => {
  try {
    console.log("User ID:", req.user._id);
    console.log("Query Params:", req.query);

    const filters = { userId: req.user._id };
    const { searchTerm } = req.query;

    if (searchTerm) {
      filters.orderId = searchTerm; 
    }
    const orders = await Order.find(filters)
      .populate("items.product") 
      .sort({ createdAt: -1 }); 

    console.log("Orders:", orders);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: error.message });
  }
};

//cancel order
const cancelOrder = async (req, res) => {
  try {
    const { orderId, item, cancelReason } = req.body;
    console.log(req.body)

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const order = await Order.findOne({ _id: orderId, userId: user._id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderItem = order.items.find((i) => i.product.toString() === item.product._id);
    if (!orderItem) {
      return res.status(404).json({ message: "Item not found in order" });
    }

    if (orderItem.status !== "pending") {
      return res.status(400).json({ message: "Order can only be cancelled in pending state" });
    }

    const product = await Product.findById(item.product);
    if (product) {
      product.quantity += orderItem.qty;
      await product.save();
    }

    orderItem.status = "cancelled";
    orderItem.cancel_reason = cancelReason || "Not specified";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order item cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//get all orders in admin
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
      status:"success",
      message:"",
      orders,
       page,
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

//set product/item status
const setItemStatus = async (req, res) => {
  try {
    const { status, item, id } = req.body;
    console.log("req", req.body)
    if (status == "delivered") {
      const payment = await Payment.findOne({ orderId: id });
      if (!payment) {
        return res.status(400).json({ success: false, message: "Payment not found for this order" });
      }

      if (payment.status == "pending") {
        await Payment.updateOne({ _id: payment._id }, { $set: { status: "success" } });
      }
    }

    const order = await Order.findOne({ _id: id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderItem = order.items.find((i) => i.product.toString() === item.product._id);
    console.log("item", orderItem)
    if (!orderItem) {
      return res.status(404).json({ message: "Item not found in order" });
    }

    orderItem.status = status
    const allDelivered = order.items.every((i) => i.status === "delivered");

    if (allDelivered) {
      order.status = "completed";
    }
    await order.save();
    console.log("status saved", order)
    return res.status(200).json({ success: true, message: `Order status updated successfully` });

  } catch (error) {
    console.log("Error in set order status" + error)
    return res.status(500).json({ success: false, message: `An error occurred` });
  }
};

//return order by user
const returnOrder = async (req, res) => {
  const { orderId, item, returnReason } = req.body;
  const user = await User.findOne({ _id: req.user._id });
  if (!user) {
    return res.json({ success: false, message: `User not found` });
  }
  const order = await Order.findOne({ _id: orderId, userId: user._id });
  if (!order) {
    return res.json({ success: false, message: `Order not found` });
  }
  const orderItem = order.items.find((i) => i.product.toString() === item.product._id);
  console.log("item", orderItem)
  if (!orderItem) {
    return res.status(404).json({ message: "Item not found in order" });
  }
  if (item.status !== "delivered") {
    return res.json({ success: false, message: "Order can only be returned after delivery" });
  }

  const payment = await Payment.findOne({ _id: order.paymentId });
  if (!payment) {
    return res.status(400).json({ success: false, message: "Payment record not found for this order" });
  }
  orderItem.returnReason = returnReason
  orderItem.status = "return requested"
  await order.save()
  return res.status(200).json({ success: true, message: "Return request sent successfully" });
};












module.exports = {
  createOrder,
  cancelOrder,
  getMyOrders,
  returnOrder,
  getAllOrders,
  findOrderById,
  setItemStatus,
}