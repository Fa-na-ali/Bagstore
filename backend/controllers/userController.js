const User = require("../models/userModel")
const bcrypt = require("bcryptjs")
const { generateToken } = require('../middlewares/generateToken')
const transporter = require('../middlewares/otpMiddleware')
const nodemailer = require("nodemailer");
const { oauth2Client } = require('../utils/googleClient');
const axios = require('axios');
require("dotenv").config();


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

        res.status(201).json({
            _id: user._id,
            name: user.name,
            isAdmin: user.isAdmin
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

//user Login
const otpStore = new Map();

const userLogin = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found!");
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Invalid password!");
            return res.status(400).json({ message: "Invalid password" });
        }

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
        res.status(200).json({ message: "OTP sent to email" });

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
            text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
        });

        console.log("OTP sent successfully to", email);
        res.status(200).json({ message: "OTP sent to email" });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//google login
const googleLogin = async(req,res)=>{
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
        console.log("google",userRes)
        const { email, name,} = userRes.data;
        // console.log(userRes);
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name,
                email,
            });
        }
        const { _id,isAdmin } = user;
        const token = generateToken(user)
        console.log("token generated",token)
        res.status(200).json({
            message: 'success',
            token,
            user,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }

}

//Logout user
const logoutUser = async (req, res) => {
    try {
        await res.cookie("jwt", "", {
            httpOnly: true,
            expires: new Date(0),
        });

        res.status(200).json({ message: "Logged out successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message })
    }

};

//update user
const updateUser = async (req, res) => {
    try {
        const { name, email, phone, currentPassword, newPassword, confirmPassword } = req.body; // Get the form data
        if (newPassword !== confirmPassword) {
            res.status(400)
            throw new Error("Passwords should match")
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) {
            res.status(404);
            throw new Error(`User not found with  id ${req.params.id}`);
        }
        else {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                password: hashedPassword,

            })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })

    }


}

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
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000; 

        otpStore.set(email, { otp, expiresAt });

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: "Your Password Reset OTP",
            html: `<p>Your OTP for password reset is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: "OTP sent to your email" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

//verify otp to reset password

const verifyOtpPassword = async (req, res) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        const storedOtpData = otpStore.get(email);

        if (!storedOtpData || storedOtpData.otp !== otp || storedOtpData.expiresAt < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
       
        if (newPassword !== confirmPassword) {
            res.status(400)
            throw new Error("Passwords should match")
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();


        otpStore.delete(email);

        res.json({ message: "Password reset successful. You can now log in!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};







module.exports = {
    userSignup,
    userLogin,
    logoutUser,
    resendOtp,
    googleLogin,
    otpStore,
    fetchUsers,
    searchUser,
    getAllUsers,
    deleteUser,
    updateUser,
    forgotPassword,
    verifyOtpPassword,
}
