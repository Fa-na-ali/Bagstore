const express = require('express')
const router = express.Router()
const { authorizeAdmin, authenticate } = require('../middlewares/authMiddleware')
const { addProduct, listProducts, deleteProduct, readProduct, } = require('../controllers/productController')
const imageUpload = require('../utils/imageUpload')

router.route('/')
.get(authenticate,authorizeAdmin,listProducts)
.post(authenticate,authorizeAdmin,imageUpload.array("pdImage"),addProduct)
router.route('/:id')
.get(authenticate,authorizeAdmin,readProduct)
.delete(authenticate,authorizeAdmin,deleteProduct)

module.exports = router