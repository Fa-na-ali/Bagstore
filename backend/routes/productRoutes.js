const express = require('express')
const router = express.Router()
const { authorizeAdmin, authenticate } = require('../middlewares/authMiddleware')
const { addProduct, deleteProduct, readProduct, deleteImage, updateProduct, fetchProducts, newProducts, fetchRelatedProducts, filterProducts, } = require('../controllers/productController')
const imageUpload = require('../imageUpload')

router.route('/new').get(newProducts)
router.route('/shop-products').get(authenticate,filterProducts)
router.route('/')
    .get(authenticate, authorizeAdmin, fetchProducts)
    .post(authenticate, authorizeAdmin, imageUpload.array("pdImage"), addProduct)
    router.route('/related/:id').get(authenticate,fetchRelatedProducts)
router.route('/:id')
    .get(authenticate, readProduct)
    .delete(authenticate, authorizeAdmin, deleteProduct)
    .put(authenticate, authorizeAdmin, imageUpload.array("pdImage"), updateProduct)
router.route('/:id/:index').delete(authenticate, authorizeAdmin, deleteImage)


module.exports = router