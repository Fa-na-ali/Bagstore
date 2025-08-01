const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin, blockDisabledUsers } = require("../middlewares/authMiddleware.js");
const { createOrder, getMyOrders, getAllOrders, findOrderById, cancelOrder, setItemStatus, returnOrder, loadPendingOrder } = require('../controllers/orderController.js');

//order routes
router.route('/').post(authenticate, blockDisabledUsers, createOrder)
router.route('/admin/orders').get(authenticate, authorizeAdmin, getAllOrders);
router.route('/mine').get(authenticate, blockDisabledUsers, getMyOrders)
router.route('/pending/order-details/:id').get(authenticate, blockDisabledUsers, loadPendingOrder)
router.route('/:id').get(findOrderById)
router.route('/cancel').put(authenticate, blockDisabledUsers, cancelOrder)
router.route('/save-item-status').put(authenticate, authorizeAdmin, setItemStatus)
router.route('/return-request').post(authenticate, blockDisabledUsers, returnOrder)
router.route('/admin/orders/edit/:id').get(findOrderById)

module.exports = router;