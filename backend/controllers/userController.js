const User = require("../models/userModel")
const bcrypt = require("bcryptjs")
const { generateToken } = require('../middlewares/generateToken')
const transporter = require('../middlewares/otpMiddleware')
const nodemailer = require("nodemailer");
require("dotenv").config();


//user registration
const userSignup = async (req, res) => {
    try {
        const { name, email, phone, password, confirmPassword } = req.body
        if (!email || !password || !name || !confirmPassword || !phone) {
            res.status(400)
            throw new Error("Please fill all the inputs")
        }
        //checking whether user exists
        const userExists = await User.findOne({ email })
        if (userExists) {
            res.status(400).send("User already exists")
            return;
        }
        if (password !== confirmPassword) {
            res.status(400)
            throw new Error("Passwords should match")
        }

        //hash the users password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        //if not create a user


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

//Logout user
const logoutUser = async (req, res) => {
    try {
        await res.cookie("jwt", "", {
            httyOnly: true,
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
        user.isBlocked = true;
        await user.save();

        res.json({ message: "User deleted successfully (soft delete)", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

//function to get a specific user
const getUser = async (req, res) => {
    try{

        const id = req.params.id;
    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "Invalid ID format" });
        return;
    }
    const user = await User.findById(id);
    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            gender: user.gender,
        })
    }
    else {
        res.status(404)
        throw new Error("User not found")
    }
    }catch(error){
        res.status(500).json({message:error.message})
    }
    
};

//function to get all users
const getAllUsers = async (req, res) => {
    try{
        const users = await User.find({})
        res.json(users)
    }
    catch(error){
        res.status(500).json({ message: error.message })
    }
    
}





module.exports = { userSignup, userLogin, logoutUser, otpStore, getUser, getAllUsers }
