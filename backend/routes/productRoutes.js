const express = require('express')
const router = express.Router()
const { authorizeAdmin, authenticate } = require('../middlewares/authMiddleware')
const { addProduct } = require('../controllers/productController')

router.route('/add-products').post(addProduct)


module.exports = router