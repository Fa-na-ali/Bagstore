const express = require('express')
const router = express.Router()
const { userSignup, userLogin, logoutUser } = require('../controllers/userController')
const { authorizeAdmin } = require('../middlewares/authMiddleware')
const verifyOtp = require('../middlewares/verifyOtp')

router.route('/signup').post(userSignup)
router.route('/login').post(userLogin)
router.route('/verify-otp').post(verifyOtp)
router.route('/adminLogin').post(userLogin, authorizeAdmin)
router.route("/logout").post(logoutUser)



module.exports = router