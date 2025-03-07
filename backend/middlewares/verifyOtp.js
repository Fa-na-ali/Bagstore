const User = require('../models/userModel');
const { otpStore } = require('../controllers/userController');
const { generateToken } = require('../middlewares/generateToken')

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        console.log("Received OTP verification request:", { email, otp });

        const storedOtp = otpStore.get(email);
        console.log("Stored OTP:", storedOtp);

        if (!storedOtp) {
            return res.status(400).json({ message: "OTP expired or not found" });
        }

        if (parseInt(otp) !== storedOtp.otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const user = await User.findOne({ email });
        console.log("User found:", user);

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const token = generateToken(user);
        console.log("Generated Token:", token);

        res.status(200).json({ message: "OTP verified", token, user });

        otpStore.delete(email);
        console.log("OTP cleared from store");

    } catch (error) {
        console.error("Error in verifyOtp:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const verifyOtpPass = async (req, res) => {
    const { email, otp } = req.body;

    try {
        console.log("Received OTP verification request:", { email, otp });

        const storedOtp = otpStore.get(email);
        console.log("Stored OTP:", storedOtp);

        if (!storedOtp) {
            return res.status(400).json({ message: "OTP expired or not found" });
        }
        if (Date.now() > storedOtp.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({ message: "OTP expired" });
        }

        if (otp !== storedOtp.otp.toString()) {
            return res.status(400).json({ message: "Invalid OTP" });
        }


        const user = await User.findOne({ email });
        console.log("User found:", user);

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        res.status(200).json({ message: "OTP verified", });
        otpStore.delete(email);
        console.log("OTP cleared from store");

    } catch (error) {
        console.error("Error in verifyOtp:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


module.exports = { verifyOtp, verifyOtpPass } 
