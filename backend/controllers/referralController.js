const STATUS_CODES = require("../statusCodes");
const Referral = require("../models/referralModel");
const User = require("../models/userModel");
const { generateReferralCode } = require("./userController");
const mongoose = require('mongoose');
const asyncHandler = require("../middlewares/asyncHandler");
const { USER_ID_MSG } = require("../messageConstants");
require('dotenv').config()

const getReferralCode = asyncHandler(async (req, res) => {

    let referral = await Referral.findOne({ user: req.user._id });

    if (referral?.referralCode) {
        return res.status(STATUS_CODES.OK).json({
            status: "success",
            referralCode: referral.referralCode,
            referralLink: `${process.env.FRONTEND_URL}/signup?ref=${referral.referralCode}`
        });
    }

    if (!referral) {
        referral = new Referral({
            user: req.user._id,
            referralCode: generateReferralCode()
        });
        await referral.save();
    }

    if (!referral.referralCode) {
        referral.referralCode = generateReferralCode();
        await referral.save();
    }

    res.status(STATUS_CODES.OK).json({
        status: "success",
        referralCode: referral.referralCode,
    });
});

const getReferrals = asyncHandler(async (req, res) => {
    const id = req.user._id.toString();
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error(USER_ID_MSG)
    }
    const user = await User.findById({ _id: id });
    if (!user) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error("User not found")
    }
    const referrals = await Referral.findOne({ user: user._id }).populate('referredUsers').populate('user');
    return res.status(STATUS_CODES.OK).json({ status: "success", referrals });
});

module.exports = {

    getReferralCode,
    getReferrals,
}
