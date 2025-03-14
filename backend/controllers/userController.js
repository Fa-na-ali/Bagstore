const User = require("../models/userModel")
const bcrypt = require("bcryptjs")
const { generateToken } = require('../middlewares/generateToken')
const transporter = require('../middlewares/otpMiddleware')
const nodemailer = require("nodemailer");
const { oauth2Client } = require('../utils/googleClient');
const axios = require('axios');
require("dotenv").config();
const mongoose = require('mongoose')
const Address = require('../models/addressModel')

const otpStore = new Map();
//user registration
const userSignup = async (req, res) => {
    try {
        const { name, email, phone, password, confirmPassword } = req.body
        if (!email || !password || !name || !confirmPassword || !phone) {
            res.status(400)
            throw new Error("Please fill all the inputs")
        }

        const userExists = await User.findOne({ email })
        if (userExists) {
            res.status(400).send("User already exists")
            return;
        }
        if (password !== confirmPassword) {
            res.status(400)
            throw new Error("Passwords should match")
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,

        })

        const otp = Math.floor(100000 + Math.random() * 900000);
        otpStore.set(email, { otp, expires: Date.now() + 300000 });

        console.log("Generated OTP:", otp);

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
        });

        console.log("OTP sent successfully to", email);
        return res.status(201).json({
            user,
            message: "User registered successfully. OTP sent to email.",
        });


    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

//user Login


const userLogin = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email }).populate("address");
        if (!user) {
            console.log("User not found!");
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch && user.isExist) {
            const { token, refreshToken } = generateToken(user);
            user.refreshToken = refreshToken;
            await user.save();
            console.log("Generated Token:", token);
            res.status(201).json({ message: "Loggedin successfully", token, refreshToken, user });
            return;
        }
        else
            res.status(400).json({ message: "Invalid credentials or blocked" })



    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//resend otp
const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        otpStore.set(email, { otp, expires: Date.now() + 300000 });

        console.log("Generated OTP:", otp);

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is ${otp}. It is valid for 3 minutes.`,
        });

        console.log("OTP sent successfully to", email);
        res.status(200).json({ message: "OTP sent to email" });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//google login
const googleLogin = async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.status(400).json({ message: "Authorization code is missing!" });
    }
    try {
        const googleRes = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(googleRes.tokens);
        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
        );
        console.log("google", userRes)
        const { email, name, } = userRes.data;
        // console.log(userRes);
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
            console.log("token generated", token)
            res.status(200).json({
                message: 'success',
                token,
                refreshToken,
                user,
            });
        }
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }

}

//Logout user
const logoutUser = async (req, res) => {
    try {

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.refreshToken = null;
        await user.save();

        res.status(200).json({ message: "Logged out successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};


//delete user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        user.isExist = false;
        await user.save();

        res.json({ message: "User deleted successfully (soft delete)", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

//function to search a specific user
// const searchUser = async (req, res) => {
//     try {
//         const { query} = req.query;

//         if (query) {
//             const users = await User.find({
//                 $or: [
//                     { name: { $regex: query, $options: 'i' } },
//                     { email: { $regex: query, $options: 'i' } }
//                 ]
//             });

//             return res.json(users);
//         }
//         const users = await User.find({});
//         res.json(users);

//     } catch (error) {
//         res.status(500).json({ message: error.message })
//     }

// };
//fetch all users using keyword and pagination
const fetchUsers = async (req, res) => {
    console.log("search")
    try {
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
        console.log("count", count)
        const user = await User.find({ ...keyword }).sort({ createdAt: -1 }).limit(pageSize).skip(pageSize * (page - 1));
        console.log("users", user)
        res.json({
            user,
            count,
            page,
            pages: Math.ceil(count / pageSize),
            hasMore: page < Math.ceil(count / pageSize),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const searchUser = async (req, res) => {
    console.log("hiii searching")
    const search = new RegExp(req.params?.search, 'i')
    if (search !== '')
        try {
            const all = await User.find({ email: search });
            console.log("search", all)
            res.status(200).json(all)
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: error.message });
        }
};

//function to get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})
        res.json(users)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }

}


//forgot password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log("email", email)
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
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

        res.json({ message: "OTP sent to your email" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

//verify otp to reset password

const resetPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (newPassword !== confirmPassword) {
            res.status(400)
            throw new Error("Passwords should match")
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({ message: "Password reset successful. You can now log in!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
//get current user
const getCurrentUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("address");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//edit user profile

const updateUser = async (req, res) => {
    console.log("req", req)
    try {
        const id = req.user._id
        console.log("id to edit user", id)
        const { name, email, phone, } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        const user = await User.findByIdAndUpdate(id, { ...req.body }, { new: true });
        console.log("user found", user)
        if (!user) {
            res.status(404);
            throw new Error(`User not found with  id ${id}`);
        }
        else {
            await user.save();
            const { token, refreshToken } = generateToken(user);
            user.refreshToken = refreshToken;
            return res.status(200).json({
                token,
                refreshToken,
                user,

            })
        }

    } catch (error) {
        res.status(500).json({ message: error.message })

    }


}

//add address
const addAddress = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, houseName, town, street, state, zipcode, country, phone } = req.body
        if (!name || !houseName || !town || !street || !state || !zipcode || !country || !phone) {
            res.status(400)
            throw new Error("Please fill all the inputs")
        }

        const addressExists = await Address.findOne({ houseName })
        if (addressExists) {
            res.status(400).send("Address already exists")
            return;
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
        res.status(201).json({ message: "Address added successfully!", address });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
//get address
const getAddress = async (req, res) => {
    try {
        const id = req.params.id
        console.log("id:", id)
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid address ID" });
        }
        const address = await Address.findById(id);

        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        res.json(address);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

//update address
const updateAddress = async (req, res) => {
    try {
        const id = req.params.id
        const { name, houseName, town, street, zipcode, state, country, phone } = req.body;
        const address = await Address.findByIdAndUpdate(id, { ...req.body }, { new: true });

        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        await address.save();
        res.json({ message: "Address updated successfully", address });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//delete address
const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.address = user.address.filter((addr) => addr._id.toString() !== req.params.id);
        await user.save();

        res.status(200).json({ message: "Address deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting address", error: error.message });
    }
};

const changePassword = async(req,res)=>{
    const id = req.user._id
    const {currentPassword,newPassword,confirmPassword} = req.body
    const exists = await User.findOne({_id: id});
    if (!exists) {
        return res.status(404).json({success: false, message: `User not found`});
    }

    const comparePassword = await bcrypt.compare(currentPassword, exists.password);

    if (!comparePassword) {
        return res.status(400).json({success: false, message: "Current password is incorrect"});
    }
    if(newPassword!== confirmPassword){
        return res.status(400).json({status:'Error',message:"Passwords should match"})
    }
    const salt = await bcrypt.genSalt(10);
    const hashed_password = await bcrypt.hash(newPassword, salt);
    await User.updateOne({_id: req.user._id}, {$set: {password: hashed_password}});
    return res.status(200).json({success: true, message: "Password updated successfully"});
}



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
}
