const express = require('express')
const router = express.Router()
const { authorizeAdmin, authenticate } = require('../middlewares/authMiddleware')
const { addProduct, deleteProduct, readProduct, deleteImage, updateProduct, fetchProducts, newProducts, } = require('../controllers/productController')
const imageUpload = require('../imageUpload')

router.route('/new').get(newProducts)
router.route('/')
    .get(authenticate, authorizeAdmin, fetchProducts)
    .post(authenticate, authorizeAdmin, imageUpload.array("pdImage"), addProduct)
router.route('/:id')
    .get(authenticate, authorizeAdmin, readProduct)
    .delete(authenticate, authorizeAdmin, deleteProduct)
    .put(authenticate, authorizeAdmin, imageUpload.array("pdImage"), updateProduct)
router.route('/:id/:index').delete(authenticate, authorizeAdmin, deleteImage)
router.route('/new').get(newProducts)

module.exports = router