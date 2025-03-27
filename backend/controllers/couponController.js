const STATUS_CODES = require("../middlewares/statusCodes");
const Coupon = require("../models/couponModel");

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
    const id = req.params.id
    console.log(id)
    try {
        const {
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
    const { id } = req.params;
    await Coupon.deleteOne({ _id: id });
    return res.status(STATUS_CODES.OK).json({
        status: "success",
        message: "Coupon deleted successfully"
    });
};

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

        res.status(STATUS_CODES.OK).json({
            status: "success",
            coupon,
        });
    } catch (error) {
        console.error("Error fetching coupon:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "An error occurred while retrieving the coupon",
        });
    }
};


module.exports = {
    addCoupon,
    getCoupons,
    deleteCoupon,
    editCoupon,
    getCouponById
}