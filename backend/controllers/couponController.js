const STATUS_CODES = require("../statusCodes");
const Coupon = require("../models/couponModel");
const Order = require('../models/orderModel');
const User = require('../models/userModel');

//create coupon
const addCoupon = async (req, res) => {
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

        return res.status(STATUS_CODES.OK).json({
            status: "success",
            message: "",
            coupons,
            count,
            page,
            pages: Math.ceil(count / limit),
            hasMore: page < Math.ceil(count / limit),
        });
    } catch (error) {
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "An error occurred"
        });
    }
};

//edit coupon
const editCoupon = async (req, res) => {

    const id = req.params.id;
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
        const editedCoupon = await Coupon.updateOne({ _id: coupon._id }, { $set: { name, description, activation, discount, expiry, minAmount, maxAmount, type, status, limit } });
        return res.status(STATUS_CODES.OK).json({
            status: "success",
            message: "Coupon updated successfully",
            editedCoupon

        });
    } catch (error) {
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

        return res.status(STATUS_CODES.OK).json({
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
        const userId = req.user._id;

        const coupons = await Coupon.find({
            status: true,
            expiry: { $gt: new Date() },
            limit: { $gt: 0 },
            usedUsers: { $ne: userId }
        });

        if (!coupons.length) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                status: "error",
                message: "No available coupons found"
            });
        }

        return res.status(STATUS_CODES.OK).json({
            status: "success",
            message: "Applicable coupons fetched successfully",
            coupons
        });

    } catch (error) {
        console.error("Error fetching applicable coupons:", error);
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Server error"
        });
    }
};


//applyCoupon
const applyCoupon = async (req, res) => {
    try {
        const { coupon_code, minAmount } = req.body;
        const coupon = await Coupon.findOne({ coupon_code: coupon_code });
        if (!coupon || coupon.limit <= 0) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ status: "error", message: "Invalid coupon code" });
        }
        if (coupon.expiry < new Date()) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ status: "error", message: "Coupon has expired" });
        }
        if (coupon.status == false) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ status: "error", message: "Coupon is inactive" });
        }
        if (minAmount && coupon.minAmount > minAmount) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ status: "error", message: "Coupon minimum amount requirement not met" });
        }
        if (coupon.limit === 0) {

            return res.status(STATUS_CODES.NOT_FOUND).json({ status: "error", message: "No more coupons available" });
        }
        const userId = req.user._id;
        const hasUsed = coupon.usedUsers.some(id => id.toString() === userId.toString());
        if (hasUsed && coupon.type === "single") {
            return res.status(STATUS_CODES.BAD_REQUEST).json({ status: "error", message: "Coupon already used" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ status: "error", message: "User not found" });
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

    } catch (error) {
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Server Error",
        });
    }

};

//Remoove coupon
const removeCoupon = async (req, res) => {

    const { coupon_code } = req.body;

    const coupon = await Coupon.findOne({ coupon_code: coupon_code });
    if (!coupon) {
        return res.status(STATUS_CODES.NOT_FOUND).json({ status: "error", message: "Coupon not found" });
    }

    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
        return res.status(STATUS_CODES.NOT_FOUND).json({ status: "error", message: "User not found" });
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
        return res.status(STATUS_CODES.BAD_REQUEST).json({ status: "error", message: "Coupon not applied to user" });
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