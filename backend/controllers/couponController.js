const STATUS_CODES = require("../statusCodes");
const Coupon = require("../models/couponModel");
const User = require('../models/userModel');
const asyncHandler = require("../middlewares/asyncHandler");

//create coupon
const addCoupon = asyncHandler(async (req, res) => {

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
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error("Coupon already exists")
    }
    const coupon = new Coupon({ name, description, activation, discount, expiry, type, minAmount, maxAmount, status, limit });
    await coupon.save();
    return res.status(STATUS_CODES.OK).json({
        status: "success",
        message: "Coupon added successfully",
        coupon
    });
});

//get coupons
const getCoupons = asyncHandler(async (req, res) => {

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

    return res.status(STATUS_CODES.OK).json({
        status: "success",
        message: "",
        coupons,
        count,
        page,
        pages: Math.ceil(count / limit),
        hasMore: page < Math.ceil(count / limit),
    });
});

//edit coupon
const editCoupon = asyncHandler(async (req, res) => {

    const id = req.params.id;

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
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error("Coupon doesn't exists")
    }
    const editedCoupon = await Coupon.updateOne({ _id: coupon._id }, { $set: { name, description, activation, discount, expiry, minAmount, maxAmount, type, status, limit } });
    return res.status(STATUS_CODES.OK).json({
        status: "success",
        message: "Coupon updated successfully",
        editedCoupon

    });
});

//delete coupon
const deleteCoupon = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const coupon = await Coupon.findById({ _id: id });
    if (coupon) {
        coupon.isExist = false
        coupon.status = false
        await coupon.save()
        return res.status(STATUS_CODES.OK).json({
            status: "success",
            message: "Coupon deleted successfully"
        });

    }
    else {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error("Coupon not found",)
    }
});

//get coupon by id
const getCouponById = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const coupon = await Coupon.findById(id);

    if (!coupon) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error("Coupon not found")
    }

    return res.status(STATUS_CODES.OK).json({
        status: "success",
        coupon,
    })
});

//get all coupons in user side
const getAllCouponsUser = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    const coupons = await Coupon.find({
        status: true,
        expiry: { $gt: new Date() },
        limit: { $gt: 0 },
        usedUsers: { $ne: userId }
    });

    if (!coupons.length) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error("No available coupons found")

    }

    return res.status(STATUS_CODES.OK).json({
        status: "success",
        message: "Applicable coupons fetched successfully",
        coupons
    });
});


//applyCoupon
const applyCoupon = asyncHandler(async (req, res) => {

    const { coupon_code, minAmount } = req.body;
    const coupon = await Coupon.findOne({ coupon_code: coupon_code });
    if (!coupon || coupon.limit <= 0) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error("Invalid coupon code");
    }
    if (coupon.expiry < new Date()) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error("Coupon has expired");
    }
    if (coupon.status == false) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error("Coupon is inactive");
    }
    if (minAmount && coupon.minAmount > minAmount) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error("Coupon minimum amount requirement not met");
    }
    if (coupon.limit === 0) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error("No more coupons available");
    }
    const userId = req.user._id;
    const hasUsed = coupon.usedUsers.some(id => id.toString() === userId.toString());
    if (hasUsed && coupon.type === "single") {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error("Coupon already used");
    }

    const user = await User.findById(userId);
    if (!user) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error("User not found");
    }

    if (!coupon.users.includes(user._id)) {
        coupon.users.push(user._id);
    }

    user.coupon = coupon._id;

    await user.save();
    await coupon.save();

    return res.status(STATUS_CODES.OK).json({
        status: "success",
        message: "Coupon applied successfully",
        coupon
    });
});

//Remoove coupon
const removeCoupon = asyncHandler(async (req, res) => {

    const { coupon_code } = req.body;

    const coupon = await Coupon.findOne({ coupon_code: coupon_code });
    if (!coupon) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error("Coupon not found");
    }

    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error("User not found");
    }


    if (user.coupon && user.coupon.toString() === coupon._id.toString()) {
        user.coupon = null;
        await user.save();

        coupon.users = coupon.users.filter(id => id.toString() !== user._id.toString());

        if (coupon.type === "single") {
            coupon.limit += 1;
        }

        await coupon.save();
        return res.status(STATUS_CODES.OK).json({ status: "success", message: "Coupon removed successfully" });
    } else {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error("Coupon not applied to user");
    }
});


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