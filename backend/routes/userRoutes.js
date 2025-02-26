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
} = require('../controllers/userController')
const { authorizeAdmin, authenticate } = require('../middlewares/authMiddleware')
const generaterefreshToken = require('../middlewares/generateRefreshToken')
const verifyOtp = require('../middlewares/verifyOtp')


router.route('/register').post(userSignup)
router.route('/login').post(userLogin)
router.route('/auth/refresh').post(generaterefreshToken)
router.route('/verify-otp').post(verifyOtp)
router.route('/resend-otp').post(resendOtp)
router.route('/google').get(googleLogin)
router.route('/forgotpassword').post(forgotPassword)
router.route('/verify-otp-password').post(verifyOtpPassword)
router.route('/').get(authenticate,authorizeAdmin,fetchUsers)
router.route('/:id').delete(authenticate,authorizeAdmin,deleteUser)
router.route('/adminLogin').post(userLogin, authorizeAdmin)
router.route("/logout").post(authenticate,logoutUser)
router.route("/search/:search").get(authenticate,authorizeAdmin,searchUser)


module.exports = router