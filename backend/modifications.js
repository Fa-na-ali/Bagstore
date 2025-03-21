// const STATUS_CODES = require("./middlewares/statusCodes");

// const setItemStatus = async (req, res) => {
//     try {
//     const { status, item, id } = req.body;
//         console.log("req", req.body)
//         if (status == "delivered") {
//           const payment = await Payment.findOne({ orderId: id });
//           if (!payment) {
//             return res.status(400).json({ success: false, message: "Payment not found for this order" });
//           }
    
//           if (payment.status == "pending") {
//             await Payment.updateOne({ _id: payment._id }, { $set: { status: "success" } });
//           }
//         }
    
//         const order = await Order.findOne({ _id: id });
    
//         if (!order) {
//           return res.status(404).json({ message: "Order not found" });
//         }
    
//         const orderItem = order.items.find((i) => i.product.toString() === item.product._id);
//         console.log("item", orderItem)
//         if (!orderItem) {
//           return res.status(404).json({ message: "Item not found in order" });
//         }

        
//     if (status === "returned") {
       
//        const product = await Product.findById({_id:item.product})
//         await Payment.updateOne({_id: order.paymentId}, {$set: {status: "refund"}});
//         await Wallet.updateOne({userId: order.userId}, {
//             $push: {
//                 transactions: {
//                     type: "credit",
//                     amount: item.qty * product.price,//change to sales price on applying offer.
//                     description: "Refund due to Return"
//                 }
//             },
//             $inc: {
//                 balance: item.quantity * product.price
//             }
//         })
//     }
//     await order.save();
//     console.log("status saved", order)
//     return res.status(STATUS_CODES.OK).json({ 
//         status:"success", 
//          message: `Order status updated successfully` });
// } catch (error) {
//     console.log("Error in set order status" + error)
//     return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
//          status:"error", 
//          message: `An error occurred` });
//   }

// };

// //cancel order
// const cancelOrder = async (req, res) => {
//   try {
//     const { orderId, item, cancelReason } = req.body;
//     console.log(req.body)

//     const user = await User.findById(req.user._id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const order = await Order.findOne({ _id: orderId, userId: user._id });
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     const orderItem = order.items.find((i) => i.product.toString() === item.product._id);
//     if (!orderItem) {
//       return res.status(404).json({ message: "Item not found in order" });
//     }

//     if (orderItem.status !== "pending") {
//       return res.status(400).json({ message: "Order can only be cancelled in pending state" });
//     }

//     const product = await Product.findById(item.product);
//     if (product) {
//       product.quantity += orderItem.qty;
//       await product.save();
//     }

//     orderItem.status = "cancelled";
//     orderItem.cancel_reason = cancelReason || "Not specified";

//     await order.save();
//     const payment = await Payment.findOne({ orderId: order._id });
//     if (!payment) {
//       return res.status(400).json({ success: false, message: "Payment not found for this order" });
//     }
//     if(payment.method!=="Cash On Delivery"){
        
//         await Payment.updateOne({_id: order.paymentId}, {$set: {status: "refund"}});
//         await Wallet.updateOne({userId: order.userId}, {
//             $push: {
//                 transactions: {
//                     type: "credit",
//                     amount: item.qty * product.price,//change to sales price on applying offer.
//                     description: "Refund due to Return"
//                 }
//             },
//             $inc: {
//                 balance: item.quantity * product.price
//             }
//         })
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Order item cancelled successfully",
//     });
//   } catch (error) {
//     console.error("Error cancelling order:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };


const apply_coupon = async (req, res) => {
    const { coupon_code, min_amount } = req.body;
    const coupon = await coupon_model.findOne({coupon_code: coupon_code});
    if (!coupon || coupon.limit <= 0) {
        return res.json({success: false, message: "Invalid coupon code"});
    }
    if (coupon.expiry < new Date()) {
        return res.json({success: false, message: "Coupon has expired"});
    }
    if (coupon.status == false) {
        return res.json({success: false, message: "Coupon is inactive"});
    }
    if (min_amount && coupon.min_amount > min_amount) {
        return res.json({success: false, message: "Coupon minimum amount requirement not met"});
    }

    if (min_amount && coupon.max_amount < min_amount) {
        return res.json({success: false, message: "Coupon maximum amount requirement exceeded"});
    }
    const user = await user_model.findOne({_id: req.session.user.id});

    if (coupon.users.includes(user._id)) {
        if (coupon.type == 'single') {
            delete user.coupon;
            await user.save();
            return res.json({success: false, message: "Coupon already applied"});
        }
        coupon.limit -= 1;
        user.coupon = coupon._id;
    } else {
        user.coupon = coupon._id;
        coupon.users.push(user._id);
        coupon.limit -= 1;
    }

    await user.save();
    await coupon.save();
    return res.json({success: true, message: "Coupon applied successfully"});
};

const remove_coupon = async (req, res) => {
    const { coupon_code } = req.body;
    const coupon = await coupon_model.findOne({coupon_code: coupon_code});
    if (!coupon) {
        return res.json({ success: false, message: "Coupon not found" });
    }
    const user = await user_model.findOne({_id: req.session.user.id});
    if (!user) {
        return res.json({ success: false, message: "User not found" });
    }
    if (user.coupon.toString() == coupon._id.toString()) {
        delete user.coupon;
        coupon.users.pull(user._id)
        if (coupon.type == "multiple") {
            coupon.limit += 1;
        }
    }

    await user.save();
    await coupon.save();
    return res.json({ success: true, message: "Coupon removed successfully" });
}