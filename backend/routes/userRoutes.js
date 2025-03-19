const express = require('express')
const router = express.Router()
const { userSignup, 
    userLogin, 
    logoutUser, 
    searchUser, 
    deleteUser, 
    updateUser, 
    forgotPassword, 
    verifyOtpPassword, 
    resendOtp,
    googleLogin,
    getAllUsers,
    fetchUsers,
    getCurrentUserProfile,
    addAddress,
    getAddress,
    updateAddress,
    deleteAddress,
    resetPassword,
    changePassword,
    uploadImage,
    deleteUserImage,
} = require('../controllers/userController')
const { authorizeAdmin, authenticate, blockDisabledUsers } = require('../middlewares/authMiddleware')
const generaterefreshToken = require('../middlewares/generateRefreshToken')
const {verifyOtp, verifyOtpPass }= require('../middlewares/verifyOtp')
const imageUpload=require("../imageUpload")


router.route('/register').post(userSignup)
router.route('/login').post(userLogin)
router.route('/auth/refresh').post(generaterefreshToken)
router.route('/verify-otp').post(verifyOtp)
router.route('/resend-otp').post(resendOtp)
router.route('/google').get(googleLogin)
router.route('/account').get(authenticate,blockDisabledUsers,getCurrentUserProfile)
router.route('/account/edit').put(authenticate,blockDisabledUsers,updateUser)
router.route('/account/add-address').post(authenticate,blockDisabledUsers,addAddress)
router.route('/account/edit-address/:id').get(authenticate,blockDisabledUsers,getAddress).put(authenticate,blockDisabledUsers,updateAddress)
router.route("/account/delete-address/:id").delete(authenticate,blockDisabledUsers,deleteAddress);
router.route('/change-password').post(authenticate,blockDisabledUsers,changePassword)
router.route('/forgot-password').post(forgotPassword)
router.route('/upload/:id').post(authenticate,blockDisabledUsers,imageUpload.array("image"),uploadImage)
router.route('/:id/:index').delete(authenticate, blockDisabledUsers, deleteUserImage)
router.route('/verify-otp-password').post(verifyOtpPass)
router.route('/reset-password').post(resetPassword)
router.route('/').get(authenticate,authorizeAdmin,fetchUsers)
router.route('/:id').delete(authenticate,authorizeAdmin,deleteUser)
router.route('/adminLogin').post(userLogin, authorizeAdmin)
router.route("/logout").post(authenticate,logoutUser)
router.route("/search/:search").get(authenticate,authorizeAdmin,searchUser)


module.exports = router