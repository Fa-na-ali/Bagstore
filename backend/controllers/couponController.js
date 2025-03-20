const STATUS_CODES = require("../middlewares/statusCodes");
const Coupon = require("../models/couponModel");

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
            message: "Coupon added successfully"
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
        const { page = 1, limit = 6 } = req.body;
        const coupons = await Coupon.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
        const total = await Coupon.countDocuments();
        return res.status(200).json({
            status: "success",
            message: "",
            coupons,
            //time: timer,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
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
    try {
        const {
            id,
            name,
            description,
            activation,
            expiry,
            discount,
            min_amount,
            max_amount,
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
        await Coupon.updateOne({ _id: coupon._id }, { $set: { name, description, activation, discount, expiry, min_amount, max_amount, type, status, limit } });
        return res.status(STATUS_CODES.OK).json({
            status: "success",
            message: "Coupon updated successfully"
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
    const {id} = req.params;
    await Coupon.deleteOne({_id: id});
    return res.status(STATUS_CODES.OK).json({
        status: "success",
        message: "Coupon deleted successfully"});
};
