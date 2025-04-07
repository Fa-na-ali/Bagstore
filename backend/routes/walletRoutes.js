const express = require('express');
const router = express.Router();
const {authenticate, authorizeAdmin, blockDisabledUsers} = require('../middlewares/authMiddleware');
const { transactionDetail, getWallets, createOrder, shareKey, updateWalletBalance, showWallet } = require('../controllers/walletController');

router.route('/admin/:id').get(authenticate,blockDisabledUsers,authorizeAdmin,transactionDetail)
router.route('/admin/wallets').get(authenticate,blockDisabledUsers,authorizeAdmin,getWallets)
router.route('/create-order').post(authenticate,blockDisabledUsers,authorizeAdmin,createOrder)
router.route('/razorpay-key').get(authenticate,blockDisabledUsers,authorizeAdmin,shareKey)
router.route('/update').post(authenticate,blockDisabledUsers,authorizeAdmin,updateWalletBalance)
router.route('/wallet').get(authenticate,blockDisabledUsers,authorizeAdmin,showWallet)

module.exports = router;