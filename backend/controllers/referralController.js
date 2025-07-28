const STATUS_CODES = require("../middlewares/statusCodes");
const Referral = require("../models/referralModel");
const User = require("../models/userModel");
const { generateReferralCode } = require("./userController");
const mongoose = require('mongoose')


const getReferralCode = async (req, res) => {

    try {

        let referral = await Referral.findOne({ user: req.user._id });

        if (referral?.referralCode) {
            return res.status(200).json({
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

        res.status(200).json({
            status: "success",
            referralCode: referral.referralCode,

        });

    } catch (error) {
        console.error("Error in referral code:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to generate referral code"
        });
    }
};
const getReferrals = async (req, res) => {
    const id = req.user._id.toString();
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
            status: "error",
            message: USER_ID_MSG
        })
    }
    const user = await User.findById({ _id: id });
    if (!user) {
        return res.status(STATUS_CODES.NOT_FOUND).json({ status: "error", message: "User not found" });
    }
    const referrals = await Referral.findOne({ user: user._id }).populate('referredUsers').populate('user');
    return res.status(STATUS_CODES.OK).json({ status: "success", referrals });
};

module.exports = {

    getReferralCode,
    getReferrals,
}
