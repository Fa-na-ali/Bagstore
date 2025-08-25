const STATUS_CODES = require("../statusCodes");
const Offer = require("../models/offerModel");
const asyncHandler = require("../middlewares/asyncHandler");

//create offer
const createOffer = asyncHandler(async (req, res) => {

    const { name } = req.body;
    const exists = await Offer.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (exists) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error("Offer already exists")

    }
    await Offer.create(req.body);
    return res.status(STATUS_CODES.OK).json({
        status: "success",
        message: "Offer added successfully"
    });
});

//get offers at admin side
const getoffers = asyncHandler(async (req, res) => {

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
    const count = await Offer.countDocuments({ ...keyword });
    const offers = await Offer.find({ ...keyword }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));

    return res.status(STATUS_CODES.OK).json({
        status: "success",
        message: "",
        offers,
        count,
        page,
        pages: Math.ceil(count / limit),
        hasMore: page < Math.ceil(count / limit),
    });
});

//editing offer  at admin
const editOffer = asyncHandler(async (req, res) => {

    const id = req.params.id;

    const {
        name,
        description,
        activation,
        expiry,
        discount,
        minAmount,
        type,

    } = req.body;
    const offer = await Offer.findOne({ _id: id });
    if (!offer) {
        res.status(STATUS_CODES.BAD_REQUEST).j
        throw new Error("Offer doesn't exists")
    }
    const editedOffer = await Offer.updateOne({ _id: offer._id }, { $set: { name, description, activation, discount, expiry, minAmount, type } });
    return res.status(STATUS_CODES.OK).json({
        status: "success",
        message: "Coupon updated successfully",
        editedOffer

    });
});

//delete offer
const deleteOffer = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const offer = await Offer.findById({ _id: id });
    if (offer) {
        offer.status = false
        await offer.save()
        return res.status(STATUS_CODES.OK).json({
            status: "success",
            message: "Offer deleted successfully"
        });

    }
    else {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error("Offer not found")
    }
});

//get offer by id
const getOfferById = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const offer = await Offer.findById(id);

    if (!offer) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error("Offer not found")
    }

    return res.status(STATUS_CODES.OK).json({
        status: "success",
        offer,
    });
});

//getting available offers 
const getAllOffers = asyncHandler(async (req, res) => {

    const offers = await Offer.find({ status: true });

    if (!offers.length) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error("Offers not found")
    }

    return res.status(STATUS_CODES.OK).json({
        status: "success",
        message: "",
        offers
    });
})

module.exports = {
    createOffer,
    getOfferById,
    getoffers,
    editOffer,
    deleteOffer,
    getAllOffers,
}
