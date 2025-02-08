const express = require('express')
const router = express.Router()
const { userSignup, 
    userLogin, 
    logoutUser, 
    searchUser, 
    deleteUser, 
    updateUser, 
    forgotPassword, 
    verifyOtpPassword ,
} = require('../controllers/userController')
const { authorizeAdmin, authenticate } = require('../middlewares/authMiddleware')
const verifyOtp = require('../middlewares/verifyOtp')

router.route('/register').post(userSignup)
router.route('/login').post(userLogin)
router.route('/verify-otp').post(verifyOtp)
router.route('/forgotpassword').post(forgotPassword)
router.route('/verify-otp-password').post(verifyOtpPassword)
router.route('/:id').put(authenticate,updateUser)
router.route('/adminLogin').post(userLogin, authorizeAdmin)
router.route("/logout").post(logoutUser)
router.route("/admin/search").post(authenticate,authorizeAdmin,searchUser)
router.route("/admin/:id").delete(authenticate,authorizeAdmin,deleteUser)


module.exports = router