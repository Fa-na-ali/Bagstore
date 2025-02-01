const express=require('express')
const router = express.Router()
const {userSignup, userLogin, logoutUser} = require('../controllers/userController')
const {authorizeAdmin} = require('../middlewares/authMiddleware')

router.route('/signup').post(userSignup)
router.route('/login').post(userLogin)
router.route('/adminLogin').post(userLogin,authorizeAdmin)
router.route("/logout").post(logoutUser)



module.exports=router