const express = require('express')
const router = express.Router()
const { authorizeAdmin, authenticate, blockDisabledUsers } = require('../middlewares/authMiddleware')
const { addProduct, deleteProduct, readProduct, deleteImage, updateProduct, fetchProducts, newProducts, fetchRelatedProducts, filterProducts,getQuantity } = require('../controllers/productController')
const imageUpload = require('../imageUpload')

router.route('/new').get(newProducts)
router.route('/idarray').get(getQuantity)
router.route('/shop-products').get(authenticate,blockDisabledUsers,filterProducts)
router.route('/')
    .get(authenticate,blockDisabledUsers, authorizeAdmin, fetchProducts)
    .post(authenticate,blockDisabledUsers, authorizeAdmin, imageUpload.array("pdImage"), addProduct)
    router.route('/related/:id').get(authenticate,blockDisabledUsers,fetchRelatedProducts)
router.route('/:id')
    .get(authenticate,blockDisabledUsers,readProduct)
    .delete(authenticate,blockDisabledUsers, authorizeAdmin, deleteProduct)
    .put(authenticate,blockDisabledUsers, authorizeAdmin, imageUpload.array("pdImage"), updateProduct)
router.route('/:id/:index').delete(authenticate, blockDisabledUsers,authorizeAdmin, deleteImage)


module.exports = router