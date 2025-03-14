const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require("../middlewares/authMiddleware.js");
const { createOrder, getMyOrders,getAllOrders, findOrderById } = require('../controllers/orderController.js');

router.route('/').post(authenticate, createOrder)
router.route('/admin/orders').get(authenticate, authorizeAdmin, getAllOrders);
router.route('/mine').get(authenticate, getMyOrders)
router.route('/:id').get(findOrderById)
   
router.route('/admin/orders/edit/:id').get(findOrderById)
   

module.exports = router;