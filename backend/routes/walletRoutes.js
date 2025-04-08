const express = require('express');
const router = express.Router();
const {authenticate, authorizeAdmin, blockDisabledUsers} = require('../middlewares/authMiddleware');
const { transactionDetail, getWallets, createOrderWallet, shareKey, updateWalletBalance, showWallet } = require('../controllers/walletController');

router.route('/admin/wallets/edit/:transactionId').get(authenticate,blockDisabledUsers,authorizeAdmin,transactionDetail)
router.route('/admin/wallets').get(authenticate,blockDisabledUsers,authorizeAdmin,getWallets)
router.route('/create-order').post(authenticate,blockDisabledUsers,createOrderWallet)
router.route('/razorpay-key').get(authenticate,blockDisabledUsers,shareKey)
router.route('/update').post(authenticate,blockDisabledUsers,updateWalletBalance)
router.route('/wallet').get(authenticate,blockDisabledUsers,showWallet)

module.exports = router;