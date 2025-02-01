const User = require("../models/userModel")
const bcrypt = require("bcryptjs")
const { generateToken } = require('../middlewares/generateToken')


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
        res.status(500).json({message:error.message})
    }
}

//user Login
const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        res.status(200).json({
            _id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            userToken: generateToken(res, existingUser._id, existingUser.isAdmin),
        });

    } catch (error) {
        
        res.status(500).json({message:error.message})
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
        res.status(500).json({message:error.message})
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
        //hash the users password
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
                phone:user.phone,
                password:hashedPassword,
                
            })
        }
    } catch (error) {
         res.status(500).json({message:error.message})
         
    }


}




module.exports = { userSignup, userLogin, logoutUser }
