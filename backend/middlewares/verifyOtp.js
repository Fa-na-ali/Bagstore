const User = require('../models/userModel');
const { otpStore } = require('../controllers/userController');
const { generateToken } = require('../middlewares/generateToken');
const asyncHandler = require('./asyncHandler');
const STATUS_CODES = require('../statusCodes');

const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const storedOtp = otpStore.get(email);

    if (!storedOtp) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error("OTP expired or not found")
    }

    if (parseInt(otp) !== storedOtp.otp) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error("Invalid OTP")
    }

    const user = await User.findOne({ email }).select('-password');

    if (!user) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error("User not found")
    }

    const { token, refreshToken } = generateToken(user);

    res.status(STATUS_CODES.OK).json({ message: "OTP verified", token, refreshToken, user });

    otpStore.delete(email);
});

const verifyOtpPass = asyncHandler(async (req, res) => {

    const { email, otp } = req.body;

    const storedOtp = otpStore.get(email);

    if (!storedOtp) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error("OTP expired or not found")
    }
    if (Date.now() > storedOtp.expiresAt) {
        otpStore.delete(email);
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error("OTP expired")
    }

    if (otp !== storedOtp.otp.toString()) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error("Invalid OTP")
    }

    const user = await User.findOne({ email });

    if (!user) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error("User not found")
    }
    res.status(STATUS_CODES.OK).json({ message: "OTP verified", });
    otpStore.delete(email);
});


module.exports = { verifyOtp, verifyOtpPass } 
