const express = require('express')
const router = express.Router()
const { authorizeAdmin, authenticate } = require('../middlewares/authMiddleware')
const { addProduct } = require('../controllers/productController')
const imageUpload = require('../utils/imageUpload')

router.route('/add-products').post(authenticate,authorizeAdmin,imageUpload.array("pdImage"),addProduct)


module.exports = router