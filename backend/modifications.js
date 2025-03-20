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