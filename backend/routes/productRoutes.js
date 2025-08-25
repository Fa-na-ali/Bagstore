const express = require('express')
const router = express.Router()
const { authorizeAdmin, authenticate, blockDisabledUsers } = require('../middlewares/authMiddleware')
const { addProduct, deleteProduct, readProduct, deleteImage, updateProduct, fetchProducts, newProducts, fetchRelatedProducts, filterProducts, getQuantity, updateWishlist, fetchWishlist, removeFromWishlist } = require('../controllers/productController')
const { imageUpload } = require('../config/cloudConfig')
const { addToCart, removeFromCart, loadCarts, updateCartQuantity } = require('../controllers/cartController')


//product routes
router.route('/add-to-cart').post(authenticate, blockDisabledUsers, addToCart)
router.route('/remove-cart/:id').delete(authenticate, blockDisabledUsers, removeFromCart)
router.route('/cart').get(authenticate, blockDisabledUsers, loadCarts)
router.route('/update-cart').post(authenticate, blockDisabledUsers, updateCartQuantity)
router.route('/new').get(newProducts)
router.route('/idarray').get(getQuantity)
router.route('/shop-products').get(authenticate, blockDisabledUsers, filterProducts)
router.route('/get-wishlist').get(authenticate, blockDisabledUsers, fetchWishlist)
router.route('/remove/wishlist').delete(authenticate, blockDisabledUsers, removeFromWishlist)
router.route('/')
    .get(authenticate, blockDisabledUsers, authorizeAdmin, fetchProducts)
    .post(authenticate, blockDisabledUsers, authorizeAdmin, imageUpload.array("pdImage"), addProduct)
router.route('/related/:id').get(authenticate, blockDisabledUsers, fetchRelatedProducts)
router.route('/:id')
    .get(authenticate, blockDisabledUsers, readProduct)
    .delete(authenticate, blockDisabledUsers, authorizeAdmin, deleteProduct)
    .put(authenticate, blockDisabledUsers, authorizeAdmin, imageUpload.array("pdImage"), updateProduct)
router.route('/:id/:index').delete(authenticate, blockDisabledUsers, authorizeAdmin, deleteImage)
router.route('/update-wishlist').post(authenticate, blockDisabledUsers, updateWishlist)


module.exports = router