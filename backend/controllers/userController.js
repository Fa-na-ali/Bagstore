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
const { USER_VALIDATION_MSG, USER_EXT_MSG, USER_PASS_VALIDATION, USER_REG_MSG, USER_NOT_MSG, USER_LOGIN_MSG, USER_INVALID_MSG, USER_EMAIL_MSG, USER_OTP_MSG, USER_GOOGLE_MSG, USER_LOGOUT_MSG, USER_DELETE_MSG, USER_PASS_RESET_MSG, USER_ID_MSG, ADDRESS_EXIST_MSG, ADDRESS_ADD_MSG, ADDRESS_INVALID_MSG, ADDRESS_NOT_MSG, ADDRESS_UPDATE_MSG, ADDRESS_DELETE_MSG } = require("../messageConstants");
const STATUS_CODES = require("../middlewares/statusCodes");
const Referral = require("../models/referralModel");
const Wallet = require('../models/wallet')

const otpStore = new Map();

const generateReferralCode = () => {
    return crypto.randomBytes(4).toString('hex');
};

//user registration
const userSignup = async (req, res) => {
    try {
        const { name, email, phone, password, confirmPassword, referCode } = req.body;

        if (!email || !password || !name || !confirmPassword || !phone) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                status: "error",
                message: USER_VALIDATION_MSG,
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                status: "error",
                message: USER_EXT_MSG
            });
        }

        if (password !== confirmPassword) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                status: "error",
                message: USER_PASS_VALIDATION
            });
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
                return res.status(STATUS_CODES.BAD_REQUEST).json({
                    status: "error",
                    message: "Invalid Rferral code "
                });
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

    } catch (error) {
        console.error("Error in user signup:", error);
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "An error occurred during registration. Please try again."
        });
    }
};

//user Login
const userLogin = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email }).populate("address");
        if (!user) {
            res.status(STATUS_CODES.NOT_FOUND).json({
                status: "error",
                message: USER_NOT_MSG
            })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch && user.isExist) {
            const { token, refreshToken } = generateToken(user);
            user.refreshToken = refreshToken;
            await user.save();
            res.status(STATUS_CODES.OK).json({
                status: "success",
                message: USER_LOGIN_MSG,
                token, refreshToken, user
            })

        }
        else
            res.status(STATUS_CODES.BAD_REQUEST).json({
                status: "error",
                message: USER_INVALID_MSG,

            })

    } catch (error) {
        console.error("Login Error:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: error.msg
        })
    }
};

//resend otp
const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(STATUS_CODES.BAD_REQUEST).json({
                status: "error",
                message: USER_EMAIL_MSG
            })
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        otpStore.set(email, { otp, expires: Date.now() + 300000 });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is ${otp}. It is valid for 3 minutes.`,
        });

        res.status(STATUS_CODES.CREATED).json({
            status: "success",
            message: USER_OTP_MSG
        })

    } catch (error) {
        console.error("Login Error:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: error.msg
        })
    }
};

//google login
const googleLogin = async (req, res) => {
    const code = req.query.code;
    if (!code) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({
            status: "error",
            message: USER_GOOGLE_MSG
        })
    }
    try {
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
            res.status(STATUS_CODES.OK).json({
                status: "success",
                message: USER_LOGIN_MSG,
                token, refreshToken, user
            })
        }
    } catch (err) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: err.msg
        })
    }

}

//Logout user
const logoutUser = async (req, res) => {
    try {

        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(STATUS_CODES.NOT_FOUND).json({
                status: "error",
                message: USER_NOT_MSG
            });
        }

        user.refreshToken = null;
        await user.save();
        res.status(STATUS_CODES.OK).json({
            status: "success",
            message: USER_LOGOUT_MSG
        });

    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: error.msg
        })
    }

};

//delete user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(STATUS_CODES.NOT_FOUND).json({
                status: "error",
                message: USER_NOT_MSG
            });
        }
        user.isExist = false;
        await user.save();
        res.status(STATUS_CODES.OK).json({
            status: "success",
            message: USER_DELETE_MSG
        });
    } catch (error) {
        console.error(error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: error.msg
        })
    }
};

//fetch all users using keyword and pagination
const fetchUsers = async (req, res) => {
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
        const user = await User.find({ ...keyword }).sort({ createdAt: -1 }).limit(pageSize).skip(pageSize * (page - 1));
        res.status(STATUS_CODES.OK).json({
            status: "success",
            user,
            count,
            page,
            pages: Math.ceil(count / pageSize),
            hasMore: page < Math.ceil(count / pageSize)
        })
    } catch (error) {
        console.error(error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: error.msg
        })
    }
};

//search user 
const searchUser = async (req, res) => {
    const search = new RegExp(req.params?.search, 'i')
    if (search !== '')
        try {
            const all = await User.find({ email: search });
            res.status(STATUS_CODES.OK).json({
                status: "success",
                all
            })
        } catch (error) {
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                status: "error",
                message: error.msg
            })
        }
};

//function to get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})
        res.status(STATUS_CODES.OK).json({
            status: "success",
            users
        })
    }
    catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: error.msg
        })
    }

}


//forgot password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            res.status(STATUS_CODES.NOT_FOUND).json({
                status: "error",
                message: USER_NOT_MSG
            });
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
        res.status(STATUS_CODES.OK).json({
            status: "success",
            message: USER_OTP_MSG
        })

    } catch (error) {
        console.error(error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: error.msg
        })
    }
};

//verify otp to reset password

const resetPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            res.status(STATUS_CODES.NOT_FOUND).json({
                status: "error",
                message: USER_NOT_MSG
            });
        }

        if (newPassword !== confirmPassword) {
            res.status(STATUS_CODES.BAD_REQUEST).json({
                status: "error",
                message: USER_PASS_VALIDATION
            });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();
        res.status(STATUS_CODES.OK).json({
            status: "success",
            message: USER_PASS_RESET_MSG
        });
    } catch (error) {
        console.error(error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: error.msg
        })
    }
};
//get current user
const getCurrentUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("address");
        if (!user) {
            res.status(STATUS_CODES.NOT_FOUND).json({
                status: "error",
                message: USER_NOT_MSG
            });
        }
        res.status(STATUS_CODES.OK).json({
            status: "success",
            user
        });

    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: error.msg
        })
    }
};

//edit user profile
const updateUser = async (req, res) => {

    try {
        const id = req.user._id
        const { name, email, phone, } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(STATUS_CODES.BAD_REQUEST).json({
                status: "error",
                message: USER_ID_MSG
            })
        }
        const user = await User.findByIdAndUpdate(id, { ...req.body }, { new: true });
        if (!user) {
            res.status(STATUS_CODES.NOT_FOUND).json({
                status: "error",
                message: USER_NOT_MSG
            });
        }
        else {
            await user.save();
            const { token, refreshToken } = generateToken(user);
            user.refreshToken = refreshToken;
            res.status(STATUS_CODES.OK).json({
                status: "success",
                token, refreshToken, user
            });
        }
    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: error.msg
        })
    }
}

//add address
const addAddress = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, houseName, town, street, state, zipcode, country, phone } = req.body
        if (!name || !houseName || !town || !street || !state || !zipcode || !country || !phone) {
            res.status(STATUS_CODES.BAD_REQUEST).json({
                status: "error",
                message: USER_VALIDATION_MSG
            })
        }
        const addressExists = await Address.findOne({ houseName })
        if (addressExists) {
            res.status(STATUS_CODES.BAD_REQUEST).json({
                status: "error",
                message: ADDRESS_EXIST_MSG
            })
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
        res.status(STATUS_CODES.CREATED).json({
            status: "success",
            message: ADDRESS_ADD_MSG,
            address
        })
    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: error.msg
        })

    }
}
//get address
const getAddress = async (req, res) => {
    try {
        const id = req.params.id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(STATUS_CODES.BAD_REQUEST).json({
                status: "error",
                message: ADDRESS_INVALID_MSG
            })
        }
        const address = await Address.findById(id);

        if (!address) {
            res.status(STATUS_CODES.NOT_FOUND).json({
                status: "error",
                message: ADDRESS_NOT_MSG
            })
        }
        res.status(STATUS_CODES.OK).json({
            status: "success",
            address
        })

    } catch (error) {
        console.error(error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: error.msg
        })

    }
};

//update address
const updateAddress = async (req, res) => {
    try {
        const id = req.params.id
        const { name, houseName, town, street, zipcode, state, country, phone } = req.body;
        const address = await Address.findByIdAndUpdate(id, { ...req.body }, { new: true });

        if (!address) {
            res.status(STATUS_CODES.NOT_FOUND).json({
                status: "error",
                message: ADDRESS_NOT_MSG
            })
        }

        await address.save();
        res.status(STATUS_CODES.OK).json({
            status: "success",
            message: ADDRESS_UPDATE_MSG
        })
    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: error.msg
        })

    }
};

//delete address
const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user)
            res.status(STATUS_CODES.NOT_FOUND).json({
                status: "error",
                message: USER_NOT_MSG
            });

        user.address = user.address.filter((addr) => addr._id.toString() !== req.params.id);
        await user.save();
        res.status(STATUS_CODES.OK).json({
            status: "success",
            message: ADDRESS_DELETE_MSG
        })
    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: error.msg
        })

    }
};

const changePassword = async (req, res) => {
    try {
        const id = req.user._id
        const { currentPassword, newPassword, confirmPassword } = req.body
        const exists = await User.findOne({ _id: id });
        if (!exists) {
            res.status(STATUS_CODES.NOT_FOUND).json({
                status: "error",
                message: USER_NOT_MSG
            });
        }

        const comparePassword = await bcrypt.compare(currentPassword, exists.password);

        if (!comparePassword) {
            res.status(STATUS_CODES.BAD_REQUEST).json({
                status: "error",
                message: "Current password is incorrect"
            });
        }
        if (newPassword !== confirmPassword) {
            res.status(STATUS_CODES.BAD_REQUEST).json({
                status: "error",
                message: USER_PASS_VALIDATION
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hashed_password = await bcrypt.hash(newPassword, salt);
        await User.updateOne({ _id: req.user._id }, { $set: { password: hashed_password } });
        res.status(STATUS_CODES.OK).json({
            status: "success",
            message: "Password updated successfully"
        });
    } catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: error.msg
        })

    }
}

//upload image for user
const uploadImage = async (req, res) => {
    try {
        const id = req.params.id;
        if (!req.files || req.files.length === 0) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                status: "error",
                message: "No files uploaded"
            });
        }
        const imageUrls = req.files.map((file) => file.filename)
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                status: "error",
                message: USER_ID_MSG
            });
        }
        const user = await User.findById({ _id: req.params.id });
        if (!user) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                status: "error",
                message: USER_NOT_MSG
            });
        }
        user.image = [...imageUrls];
        await user.save();

        return res.status(STATUS_CODES.OK).json({
            status: "success",
            user
        });

    } catch (error) {
        console.error("Error in uploadImage:", error);
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "An error occurred while uploading images"
        });
    }
};

//delete image
const deleteUserImage = async (req, res) => {

    try {
        const { id, index } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                status: "error",
                message: USER_ID_MSG
            })
        }
        const user = await User.findById(id);
        if (!user)
            return res.status(STATUS_CODES.NOT_FOUND).json({
                status: "error",
                message: USER_NOT_MSG
            });


        if (index < 0 || index >= user.image.length) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                status: "error",
                message: "Invalid image index"
            });
        }

        user.image.splice(index, 1);
        await user.save();
        return res.status(STATUS_CODES.OK).json({
            status: "success",
            message: "Image Deleted Successfully"
        });
    } catch (error) {
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: error.message
        });
    }
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
    uploadImage,
    deleteUserImage,
    generateReferralCode,
}
