const Order = require("../models/orderModel");
const Wallet = require("../models/wallet");
const Razorpay = require("razorpay");
const User = require('../models/userModel');
const STATUS_CODES = require("../statusCodes");
const asyncHandler = require("../middlewares/asyncHandler");
require('dotenv').config()

const getWallets = asyncHandler(async (req, res) => {

    const limit = 6;
    const page = Number(req.query.page) || 1;
    const wallets = await Wallet.find()
        .populate('userId', 'name email')
        .sort({ 'transactions.createdAt': -1 });
    const transactionData = [];
    wallets.forEach(wallet => {
        wallet.transactions.forEach(transaction => {
            transactionData.push({
                _id: transaction._id,
                transactionId: transaction.transactionId,
                transactionDate: transaction.createdAt,
                email: wallet.userId.email,
                type: transaction.type,
                amount: transaction.amount.toFixed(2),
            });
        });
    });
    const count = transactionData?.length

    transactionData.sort((a, b) => b.transactionDate - a.transactionDate);

    let start = (page - 1) * limit;
    let end = page * limit;
    let paginatedTransactions = transactionData.slice(start, end);

    return res.status(STATUS_CODES.OK).json({
        status: "success",
        transactionData: paginatedTransactions,
        count,
        page,
        pages: Math.ceil(count / limit),
        hasMore: page < Math.ceil(count / limit),
    })
})


const transactionDetail = asyncHandler(async (req, res) => {

    const id = req.params.transactionId;
    const wallet = await Wallet.findOne({ 'transactions._id': id })
        .populate('userId', 'name email');
    if (!wallet) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error("Transaction not found")
    }
    const transaction = wallet.transactions && Array.isArray(wallet.transactions)
        ? wallet.transactions.find(tx => tx._id.toString() === id)
        : null;

    if (!transaction) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error("Transaction not found")
    }

    let order = null;
    let orderButton = null;
    let transactionType = 'Regular Transaction';
    let description = transaction.description.toLowerCase();


    if (description.includes('order payment')) {
        transactionType = 'Debited';


        const words = transaction.description.split(' ');
        const orderNumber = words[words.length - 1];

        if (orderNumber) {
            order = await Order.findOne({ 'orderNumber': orderNumber });

            if (order) {
                orderButton = `/admin/orders/edit/${order._id}`;
            }
        }
    }

    else if (description.includes('referral')) {
        transactionType = 'Referral Bonus';
    }

    else if (description.includes('added')) {
        transactionType = 'Wallet Recharge';
    }

    else if (description.includes('returned')) {
        transactionType = 'Order Returned';


        const words = transaction.description.split(' ');
        const orderNumber = words[words.length - 1];

        if (orderNumber) {
            order = await Order.findOne({ 'orderNumber': orderNumber });

            if (order) {
                orderButton = `/admin/orders/edit/${order._id}`;
            }
        }
    }

    else if (description.includes('cancelled')) {
        transactionType = 'Order Cancelled';


        const words = transaction.description.split(' ');
        const orderNumber = words[words.length - 1];

        if (orderNumber) {
            order = await Order.findOne({ 'orderNumber': orderNumber });

            if (order) {
                orderButton = `/admin/orders/edit/${order._id}`;
            }
        }
    }

    else if (description.includes('refund') || description.includes('cancellation')) {
        const orderNumber = transaction.description.split('#')[1];

        if (orderNumber) {
            order = await Order.findOne({ 'orderNumber': orderNumber });

            if (order) {
                orderButton = `/admin/orders/edit/${order._id}`;
                transactionType = order.status === 'Cancelled' ? 'Order Cancelled' : 'Order Returned';
            }
        }
    }


    return res.status(STATUS_CODES.OK).json({
        status: "success",
        user: wallet.userId,
        transaction: {
            transaction,
            orderButton,
            transactionType
        },
        title: 'Transaction Details'
    });
});

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

//show walet for user
const showWallet = asyncHandler(async (req, res) => {

    const userId = req.user._id;
    const user = await User.findById({ _id: userId });
    let wallet = await Wallet.findOne({ userId: userId });

    if (!wallet) {
        wallet = new Wallet({ userId: userId, balance: 0, transactions: [] });
        await wallet.save();
    }

    wallet.transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(STATUS_CODES.OK).json({
        status: "success",
        message: "",
        user,
        wallet,
    })
});

//create order for razorpay
const createOrderWallet = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: `receipt_order_${Math.random()}`,
        payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    return res.status(STATUS_CODES.OK).json({ status: "success", order });
});

const shareKey = (req, res) => {
    return res.status(STATUS_CODES.OK).json({ status: "success", key: process.env.RAZORPAY_KEY_ID });
}

//update wallet balance
const updateWalletBalance = asyncHandler(async (req, res) => {

    const { amount } = req.body;
    const userId = req.user._id;
    let wallet = await Wallet.findOne({ userId: userId });

    if (!wallet) {
        wallet = new Wallet({ user_id: userId, balance: 0, transactions: [] });
    }


    wallet.balance += parseFloat(amount);


    wallet.transactions.push({
        type: 'Credit',
        amount: parseFloat(amount),
        description: `Added Rs. ${amount} to wallet`,
        createdAt: new Date(),
    });

    await wallet.save();

    return res.status(STATUS_CODES.OK).json({ status: "success", balance: wallet.balance });
});

module.exports = {
    getWallets,
    transactionDetail,
    showWallet,
    createOrderWallet,
    shareKey,
    updateWalletBalance
}
