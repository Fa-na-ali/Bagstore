const express=require('express')
const router = express.Router()
const {userSignup, userLogin, logoutUser} = require('../controllers/userController')

router.route('/signup').post(userSignup)
router.route('/login').post(userLogin)
router.route("/logout").post(logoutUser)



module.exports=router