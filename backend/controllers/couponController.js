const STATUS_CODES = require("../middlewares/statusCodes");
const Coupon = require("../models/couponModel");
const Order = require('../models/orderModel');
const User = require('../models/userModel');

//create coupon
const addCoupon = async (req, res) => {
    console.log("Received Coupon Data:", req.body);
    try {
        const {
            name,
            description,
            activation,
            expiry,
            discount,
            minAmount,
            maxAmount,
            type,
            status,
            limit
        } = req.body;
        const exists = await Coupon.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (exists) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                status: "error",
                message: "Coupon already exists"
            });
        }
        const coupon = new Coupon({ name, description, activation, discount, expiry, type, minAmount, maxAmount, status, limit });
        await coupon.save();
        return res.status(STATUS_CODES.OK).json({
            status: "success",
            message: "Coupon added successfully",
            coupon
        });
    } catch (error) {
        console.log("Error in adding coupon" + error)
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "An error occurred"
        });
    }
};

//get coupons
const getCoupons = async (req, res) => {
    try {
        const limit = 6;
        const page = Number(req.query.page) || 1;
        const keyword = req.query.keyword
            ? {
                name: {
                    $regex: req.query.keyword,
                    $options: "i",
                },
                
            }
            : {};
            const count = await Coupon.countDocuments({ ...keyword });
        const coupons = await Coupon.find({ ...keyword }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
        
        return res.status(200).json({
            status: "success",
            message: "",
            coupons,
            //time: timer,
            count,
            page,
            pages: Math.ceil(count / limit),
            hasMore: page < Math.ceil(count / limit),
        });
    } catch (error) {
        console.log("Error in getting coupons", error);
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "An error occurred"
        });
    }
};

//edit coupon
const editCoupon = async (req, res) => {

    const id = req.params.id;
    console.log("Received request to update coupon with ID:", id);
    console.log("Request Body:", req.body);
    try {
        const {
            name,
            description,
            activation,
            expiry,
            discount,
            minAmount,
            maxAmount,
            type,
            status,
            limit
        } = req.body;
        const coupon = await Coupon.findOne({ _id: id });
        if (!coupon) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                status: "error",
                message: "Coupon doesn't exists"
            });
        }
       const editedCoupon =  await Coupon.updateOne({ _id: coupon._id }, { $set: { name, description, activation, discount, expiry, minAmount, maxAmount, type, status, limit } });
        return res.status(STATUS_CODES.OK).json({
            status: "success",
            message: "Coupon updated successfully",
            editedCoupon

        });
    } catch (error) {
        console.log("Error in updating coupon" + error)
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "An error occurred" + error
        });
    }
};

//delete coupon
const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
    const coupon = await Coupon.findById({ _id: id });
    if(coupon){
        coupon.isExist = false
        coupon.status=false
        await coupon.save()
        return res.status(STATUS_CODES.OK).json({
            status: "success",
            message: "Coupon deleted successfully"
        });

    }
    else{
        return res.status(STATUS_CODES.NOT_FOUND).json({
            status: "error",
            message: "Coupon not found",
        });
    }
        
    } catch (error) {
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "An error occurred while retrieving the coupon",
        });
    }  
};

//get coupon by id
const getCouponById = async (req, res) => {
    try {
        const { id } = req.params;

        const coupon = await Coupon.findById(id);

        if (!coupon) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                status: "error",
                message: "Coupon not found",
            });
        }

       return  res.status(STATUS_CODES.OK).json({
            status: "success",
            coupon,
        });
    } catch (error) {
        console.error("Error fetching coupon:", error);
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "An error occurred while retrieving the coupon",
        });
    }
};


//get all coupons in user side
 const getAllCouponsUser = async (req, res) => {
    try {
        const coupons = await Coupon.find({status:true});  

        if (!coupons.length) {
           return  res.status(STATUS_CODES.NOT_FOUND).json({
                status:"error",
                message:"Coupons not found"
            })
            
        }
    
        return res.status(STATUS_CODES.OK).json({ 
            status:"success",
            message:"",
            coupons
        });
        
    } catch (error) {
        console.log(error)
       return  res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Server Error",
        });
    }
   
}

//applyCoupon
const applyCoupon = async (req, res) => {
    try {
        const { coupon_code, minAmount } = req.body;
    const coupon = await Coupon.findOne({coupon_code: coupon_code});
    if (!coupon || coupon.limit <= 0) {
        return res.json({success: false, message: "Invalid coupon code"});
    }
    if (coupon.expiry < new Date()) {
        return res.json({success: false, message: "Coupon has expired"});
    }
    if (coupon.status == false) {
        return res.json({success: false, message: "Coupon is inactive"});
    }
    if (minAmount && coupon.minAmount > minAmount) {
        return res.json({success: false, message: "Coupon minimum amount requirement not met"});
    }

    if (minAmount && coupon.maxAmount < minAmount) {
        return res.json({success: false, message: "Coupon maximum amount requirement exceeded"});
    }
    const user = await User.findOne({_id: req.user._id});
    const order = await Order.findOne({couponId:coupon._id})

    if (order && coupon.users.includes(user._id)) {
       
        if (coupon.type == 'single') {
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
    return res.status(STATUS_CODES.OK).json({
        status:"success",
        message: "Coupon applied successfully",
        coupon
    });
        
    } catch (error) {
        console.log(error)
       return  res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Server Error",
        });
    }
    
};

//Remoove coupon
const removeCoupon = async (req, res) => {
    console.log("coup req", req.body);
    const { coupon_code } = req.body;

    const coupon = await Coupon.findOne({ coupon_code: coupon_code });
    if (!coupon) {
        return res.json({ success: false, message: "Coupon not found" });
    }

    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
        return res.json({ success: false, message: "User not found" });
    }

    // Check if the user has this coupon
    if ( user.coupon && user.coupon.toString() === coupon._id.toString()) {
        user.coupon = null; // Explicitly setting it to null
        await user.save(); // Save the updated user object

        // Remove user from coupon's users array
        coupon.users = coupon.users.filter(id => id.toString() !== user._id.toString());

        if (coupon.type === "single") {
            coupon.limit += 1;
        }

        await coupon.save(); // Save the updated coupon object
        return res.json({ success: true, message: "Coupon removed successfully" });
    } else {
        return res.json({ success: false, message: "Coupon not applied to user" });
    }
};


module.exports = {
    addCoupon,
    getCoupons,
    deleteCoupon,
    editCoupon,
    getCouponById,
    getAllCouponsUser,
    applyCoupon,
    removeCoupon
}