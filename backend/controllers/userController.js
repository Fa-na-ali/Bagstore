const User = require("../models/userModel")
const bcrypt = require("bcryptjs")
const crypto = require('crypto');
const { generateToken } = require('../middlewares/generateToken')
const transporter = require('../middlewares/otpMiddleware')
const nodemailer = require("nodemailer");
const { oauth2Client } = require('../utils/googleClient');
const axios = require('axios');
require("dotenv").config();
const mongoose = require('mongoose')
const Address = require('../models/addressModel')
const responseHandler = require('./../middlewares/responseHandler');
const { USER_VALIDATION_MSG, USER_EXT_MSG, USER_PASS_VALIDATION, USER_REG_MSG, USER_NOT_MSG, USER_LOGIN_MSG, USER_INVALID_MSG, USER_EMAIL_MSG, USER_OTP_MSG, USER_GOOGLE_MSG, USER_LOGOUT_MSG, USER_DELETE_MSG, USER_PASS_RESET_MSG, USER_ID_MSG, ADDRESS_EXIST_MSG, ADDRESS_ADD_MSG, ADDRESS_INVALID_MSG, ADDRESS_NOT_MSG, ADDRESS_UPDATE_MSG, ADDRESS_DELETE_MSG, USER_VALIDATION_MSG2 } = require("../messageConstants");
const STATUS_CODES = require("../statusCodes");
const Referral = require("../models/referralModel");
const Wallet = require('../models/wallet');
const asyncHandler = require("../middlewares/asyncHandler");

const otpStore = new Map();

const generateReferralCode = () => {
    return crypto.randomBytes(4).toString('hex');
};

//user registration
const userSignup = asyncHandler(async (req, res) => {

    const { name, email, phone, password, confirmPassword, referCode } = req.body;

    if (!email || !password || !name || !confirmPassword || !phone) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error(USER_VALIDATION_MSG)
    }
    if (name.lenght > 25) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error(USER_VALIDATION_MSG2)
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error(USER_EXT_MSG)
    }

    if (password !== confirmPassword) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error(USER_PASS_VALIDATION)
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
    });

    const referral = new Referral({
        user: user._id,
        referralCode: generateReferralCode(),
    });
    await referral.save();

    if (referCode) {
        const referrer = await Referral.findOne({ referralCode: referCode });

        if (!referrer) {
            res.status(STATUS_CODES.BAD_REQUEST)
            throw new Error("Invalid Rferral code ")
        } else {

            referrer.referredUsers.push(user._id);
            referrer.amountEarned += 150

            let refWallet = await Wallet.findOne({ userId: referrer.user });

            if (!refWallet) {

                refWallet = new Wallet({
                    userId: referrer.user,
                    balance: 150,
                    transactions: [{
                        amount: 150,
                        type: 'Credit',
                        description: `Referral Bonus for referring ${user.email}`,
                        date: new Date()
                    }]
                });
            } else {

                refWallet.balance += 150;
                refWallet.transactions.push({
                    amount: 150,
                    type: 'Credit',
                    description: `Referral Bonus for referring ${user.email}`,
                    date: new Date()
                });
            }

            await refWallet.save();
            await referrer.save();

        }
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore.set(email, { otp, expires: Date.now() + 300000 });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
        html: `<p>Your OTP code is <strong>${otp}</strong>. It is valid for 5 minutes.</p>`
    });

    return res.status(STATUS_CODES.CREATED).json({
        status: "success",
        message: USER_REG_MSG,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone
        }
    });
});

//user Login
const userLogin = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("address");
    if (!user) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error(USER_NOT_MSG)
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch && user.isExist) {
        const { token, refreshToken } = generateToken(user);
        user.refreshToken = refreshToken;
        await user.save();
        return res.status(STATUS_CODES.OK).json({
            status: "success",
            message: USER_LOGIN_MSG,
            token, refreshToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                isAdmin: user.isAdmin,
                isExist: user.isExist,
            }
        })

    }
    else {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error(USER_INVALID_MSG)
    }
});

//resend otp
const resendOtp = asyncHandler(async (req, res) => {

    const { email } = req.body;

    if (!email) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error(USER_EMAIL_MSG)
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore.set(email, { otp, expires: Date.now() + 300000 });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}. It is valid for 3 minutes.`,
    });

    return res.status(STATUS_CODES.CREATED).json({
        status: "success",
        message: USER_OTP_MSG
    })
});

//google login
const googleLogin = asyncHandler(async (req, res) => {
    const code = req.query.code;
    if (!code) {
        res.status(STATUS_CODES.UNAUTHORIZED)
        throw new Error(USER_GOOGLE_MSG)
    }

    const googleRes = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(googleRes.tokens);
    const userRes = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
    );
    const { email, name, } = userRes.data;
    let user = await User.findOne({ email }).populate("address");

    if (!user) {
        user = await User.create({
            name,
            email,
        });
    }
    const { _id, isAdmin } = user;
    if (user.isExist) {
        const { token, refreshToken } = generateToken(user)
        user.refreshToken = refreshToken;
        await user.save();
        return res.status(STATUS_CODES.OK).json({
            status: "success",
            message: USER_LOGIN_MSG,
            token, refreshToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                isAdmin: user.isAdmin,
                isExist: user.isExist,
            }
        })
    }
    else {
        res.status(STATUS_CODES.UNAUTHORIZED)
        throw new Error("You are blocked")
    }
});

//Logout user
const logoutUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error(USER_NOT_MSG)
    }

    user.refreshToken = null;
    await user.save();
    return res.status(STATUS_CODES.OK).json({
        status: "success",
        message: USER_LOGOUT_MSG
    });
});

//delete user
const deleteUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error(USER_NOT_MSG)
    }
    user.isExist = false;
    user.token = null
    await user.save();
    return res.status(STATUS_CODES.OK).json({
        status: "success",
        message: USER_DELETE_MSG
    });
});

//fetch all users using keyword and pagination
const fetchUsers = asyncHandler(async (req, res) => {

    const pageSize = 6;
    const page = Number(req.query.page) || 1;
    const keyword = req.query.keyword
        ? {
            email: {
                $regex: req.query.keyword,
                $options: "i",
            },
        }
        : {};

    const count = await User.countDocuments({ ...keyword });
    const user = await User.find({ ...keyword }).select("-password").sort({ createdAt: -1 }).limit(pageSize).skip(pageSize * (page - 1));
    return res.status(STATUS_CODES.OK).json({
        status: "success",
        user,
        count,
        page,
        pages: Math.ceil(count / pageSize),
        hasMore: page < Math.ceil(count / pageSize)
    })
});

//search user 
const searchUser = asyncHandler(async (req, res) => {
    const search = new RegExp(req.params?.search, 'i')
    if (search !== '') {
        const all = await User.find({ email: search }).select("-password");
        return res.status(STATUS_CODES.OK).json({
            status: "success",
            all
        })
    }
});

//function to get all users
const getAllUsers = asyncHandler(async (req, res) => {

    const users = await User.find({}).select("-password")
    return res.status(STATUS_CODES.OK).json({
        status: "success",
        users
    })
});

//forgot password
const forgotPassword = asyncHandler(async (req, res) => {

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error(USER_NOT_MSG)
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 3 * 60 * 1000;

    otpStore.set(email, { otp, expiresAt });

    const mailOptions = {
        to: user.email,
        from: process.env.EMAIL_USER,
        subject: "Your Password Reset OTP",
        html: `<p>Your OTP for password reset is <b>${otp}</b>. It is valid for 3 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);
    return res.status(STATUS_CODES.OK).json({
        status: "success",
        message: USER_OTP_MSG
    })
});

//verify otp to reset password
const resetPassword = asyncHandler(async (req, res) => {

    const { email, newPassword, confirmPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error(USER_NOT_MSG)
    }

    if (newPassword !== confirmPassword) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error(USER_PASS_VALIDATION)
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    return res.status(STATUS_CODES.OK).json({
        status: "success",
        message: USER_PASS_RESET_MSG
    });
})

//get current user
const getCurrentUserProfile = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id).select("-password").populate("address");
    if (!user) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error(USER_NOT_MSG)
    }
    return res.status(STATUS_CODES.OK).json({
        status: "success",
        user
    });
});

//edit user profile
const updateUser = asyncHandler(async (req, res) => {

    const id = req.user._id
    const { name, email, phone, } = req.body;

    if (name.lenght > 25) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error(USER_VALIDATION_MSG2)
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error(USER_ID_MSG)
    }
    const user = await User.findByIdAndUpdate(id, { ...req.body }, { new: true }).select("-password");
    if (!user) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error(USER_NOT_MSG)
    }
    else {
        await user.save();
        const { token, refreshToken } = generateToken(user);
        user.refreshToken = refreshToken;
        return res.status(STATUS_CODES.OK).json({
            status: "success",
            token, refreshToken, user
        });
    }
});

//add address
const addAddress = asyncHandler(async (req, res) => {

    const userId = req.user._id;
    const { name, houseName, town, street, state, zipcode, country, phone } = req.body
    if (!name || !houseName || !town || !street || !state || !zipcode || !country || !phone) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error(USER_VALIDATION_MSG)
    }
    const addressExists = await Address.findOne({ houseName })
    if (addressExists) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error(ADDRESS_EXIST_MSG)
    }
    const address = await Address.create({
        name,
        houseName,
        town,
        street,
        state,
        zipcode,
        country,
        phone,
        user: userId,

    })
    await User.findByIdAndUpdate(userId, { $push: { address: address._id } });
    return res.status(STATUS_CODES.CREATED).json({
        status: "success",
        message: ADDRESS_ADD_MSG,
        address
    })
});

//get address
const getAddress = asyncHandler(async (req, res) => {

    const id = req.params.id
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error(ADDRESS_INVALID_MSG)
    }
    const address = await Address.findById(id);

    if (!address) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error(ADDRESS_NOT_MSG)
    }
    return res.status(STATUS_CODES.OK).json({
        status: "success",
        address
    })
});

//update address
const updateAddress = asyncHandler(async (req, res) => {

    const id = req.params.id
    const { name, houseName, town, street, zipcode, state, country, phone } = req.body;
    const address = await Address.findByIdAndUpdate(id, { ...req.body }, { new: true });

    if (!address) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error(ADDRESS_NOT_MSG)
    }

    await address.save();
    return res.status(STATUS_CODES.OK).json({
        status: "success",
        message: ADDRESS_UPDATE_MSG
    })
});

//delete address
const deleteAddress = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error(USER_NOT_MSG)
    }

    user.address = user.address.filter((addr) => addr._id.toString() !== req.params.id);
    await user.save();
    return res.status(STATUS_CODES.OK).json({
        status: "success",
        message: ADDRESS_DELETE_MSG
    })
});

//change password
const changePassword = asyncHandler(async (req, res) => {

    const id = req.user._id
    const { currentPassword, newPassword, confirmPassword } = req.body
    const exists = await User.findOne({ _id: id });
    if (!exists) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error(USER_NOT_MSG)
    }

    const comparePassword = await bcrypt.compare(currentPassword, exists.password);

    if (!comparePassword) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error("Current password is incorrect")
    }
    if (newPassword !== confirmPassword) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error(USER_PASS_VALIDATION)
    }
    const salt = await bcrypt.genSalt(10);
    const hashed_password = await bcrypt.hash(newPassword, salt);
    await User.updateOne({ _id: req.user._id }, { $set: { password: hashed_password } });
    return res.status(STATUS_CODES.OK).json({
        status: "success",
        message: "Password updated successfully"
    });
})

//upload image for user
const uploadImage = asyncHandler(async (req, res) => {

    const id = req.params.id;
    if (!req.files || req.files.length === 0) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error("No files uploaded")
    }
    const imageUrls = req.files.map((file) => file.path)
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error(USER_ID_MSG)
    }
    const user = await User.findById({ _id: req.params.id }).select("-password");
    if (!user) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error(USER_NOT_MSG)
    }
    user.image = [...imageUrls];
    await user.save();

    return res.status(STATUS_CODES.OK).json({
        status: "success",
        user
    });
});

//delete image
const deleteUserImage = asyncHandler(async (req, res) => {

    const { id, index } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error(USER_ID_MSG)
    }
    const user = await User.findById(id);
    if (!user) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error(USER_NOT_MSG)
    }

    if (index < 0 || index >= user.image.length) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error("Invalid image index")
    }

    user.image.splice(index, 1);
    await user.save();
    return res.status(STATUS_CODES.OK).json({
        status: "success",
        message: "Image Deleted Successfully"
    });
});

module.exports = {
    userSignup,
    userLogin,
    logoutUser,
    resendOtp,
    googleLogin,
    otpStore,
    getCurrentUserProfile,
    fetchUsers,
    searchUser,
    getAllUsers,
    deleteUser,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword,
    addAddress,
    getAddress,
    updateAddress,
    deleteAddress,
    uploadImage,
    deleteUserImage,
    generateReferralCode,
}
