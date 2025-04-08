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

    if (orderItem.status !== "Pending") {
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
    const payment = await Payment.findOne({ orderId: order._id });
    if (!payment) {
      return res.status(400).json({ success: false, message: "Payment not found for this order" });
    }
    if(payment.method!=="Cash On Delivery"){
        
        await Payment.updateOne({_id: order.paymentId}, {$set: {status: "refund"}});
        await Wallet.updateOne({userId: order.userId}, {
            $push: {
                transactions: {
                    type: "credit",
                    amount: item.qty * product.price,//change to sales price on applying offer.
                    description: "Refund due to Return"
                }
            },
            $inc: {
                balance: item.quantity * product.price
            }
        })
    }

    return res.status(200).json({
      success: true,
      message: "Order item cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


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

const createOrder = async (req, res) => {
    
    try {
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
        
           if (paymentMethod === "Cash On Delivery" && totalPrice > 1000) {
             return res.json({ message: "COD payment is not available for orders above ₹ 1000" });
            }
            console.log("validated", validatedItems)
        if (paymentMethod == "wallet") {
            const wallet = await Wallet.findOne({ userId: user._id })
            if (!wallet || wallet.balance < totalPrice) {
                return res.json({ success: false, message: "Insufficient balance in wallet" });
            }
            wallet.balance -= totalPrice;
            wallet.transactions.push({
                amount: totalPrice,
                type: "debit",
                description: "Order payment",
            });
            await wallet.save();
        }

        let paymentData = new Payment({
            userId: user._id,
            method: paymentMethod,
            amount: totalPrice,
        });

        if (paymentMethod == "razorpay" && razorpay_order_id != "") {
            paymentData.razorpay_order_id = razorpay_order_id;
            paymentData.status = status;
        }

        if (paymentMethod == "wallet") {
            paymentData.status = "success";
        }

        if (!isNaN(coupon_discount)) {
            paymentData.coupon_discount = coupon_discount;
        }

        const payment = await paymentData.save();

        let orders = [];
        const parsedCarts = JSON.parse(carts);

        for (const cartId of parsedCarts) {
            const product_cart = await cart_model.findOne({ _id: cartId }).session(session);
            if (!product_cart) continue;

            const product = await product_model.findOne({ _id: product_cart.product }).session(session);
            if (!product) continue;

            let variant = product.variants.find((v) => v.name === product_cart.variant);
            if (!variant) continue;

            const colorDetail = variant.colors.find((color) => color.color === product_cart.color);
            if (!colorDetail) continue;

            if (colorDetail.quantity < product_cart.quantity) {
                return res.json({ success: false, message: `Insufficient quantity in stock for selected color` });
            }

            let finalPrice = product_cart.quantity * colorDetail.price;
            if (product.offer && product.offer !== "none") {
                const offer = await offer_model.findOne({ name: product.offer }).session(session);
                if (offer) {
                    finalPrice -= Math.ceil(colorDetail.price * offer.discount / 100);
                }
            }

            const order_item = new Order({
                userId: user._id,
                productId: product._id,
                items: validatedItems,
                shippingAddress,
                paymentMethod,
                status: "not completed",
                totalPrice,
                couponId,
                paymentId: payment._id,
               // discount: offer discount on a particular product,(should be added to the items)
            });

            const order = await order_item.save();
           

            colorDetail.quantity -= product_cart.quantity;

            product.ordered += 1;
            await product.save();

           
        }

        await Payment.updateOne(
            { _id: payment._id },
            { $set: { orders: orders } },
            
        );

        user.coupon = null;
        await user.save({ session });
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Order placed successfully",
            order_id: payment._id,
        });

    } catch (error) {
        console.error("Error placing order:", error);
        await session.abortTransaction();
        session.endSession();

        return res.status(500).json({
            success: false,
            message: "An error occurred while placing the order",
        });
    }
};

