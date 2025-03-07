const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require("../middlewares/authMiddleware.js");
const { createOrder, getMyOrders,getAllOrders } = require('../controllers/orderController.js');


router.route('/').post(authenticate, createOrder)
router.route('/admin/orders').get(authenticate, authorizeAdmin, getAllOrders);
router.route('/mine').get(authenticate, getMyOrders)

module.exports = router;