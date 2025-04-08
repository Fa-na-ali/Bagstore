const Order = require("../models/orderModel");
const Wallet = require("../models/wallet");
const Razorpay = require("razorpay");
const User = require('../models/userModel')


const getWallets = async (req, res) => {
    try {
        const limit = 6;
        const page = Number(req.query.page) || 1;
        const count = await Wallet.countDocuments({});
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
                    user: `${wallet.userId.name}`,
                    email: wallet.userId.email,
                    type: transaction.type,
                    amount: transaction.amount,
                    description: transaction.description
                });
            });
        });

        transactionData.sort((a, b) => b.transactionDate - a.transactionDate);


        res.status(200).json({
            status: "success",
            transactionData,
            count,
            page,
            pages: Math.ceil(count / limit),
            hasMore: page < Math.ceil(count / limit),
        })
    } catch (error) {
        console.error('Error fetching wallet transactions:', error);
        res.status(500).json({
            status: "error",
            message: 'Internal Server Error'
        });
    }
}


const transactionDetail = async (req, res) => {
    try {
        const id = req.params.transactionId;
      console.log("id",id)

        const wallet = await Wallet.findOne({ 'transactions._id': id })
            .populate('userId', 'name email');
        console.log("wallet",wallet)
        if (!wallet) {
            return res.status(404).json({
                status: 'error',
                message: "Transaction not found"
            });
        }


        const transaction = wallet.transactions && Array.isArray(wallet.transactions)
            ? wallet.transactions.find(tx => tx._id.toString() === id)
            : null;

        if (!transaction) {
            return res.status(404).json({
                status: 'error',
                message: "Transaction not found"
            });
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


        res.status(200).json({
            status:"success",
            user: wallet.userId,
            transaction: {
                transaction,
                orderButton,
                transactionType
            },
            title: 'Transaction Details'
        });

    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).send('Internal Server Error');
    }
};

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

//show walet for user
const showWallet = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById({ _id: userId });
        let wallet = await Wallet.findOne({ userId: userId });

        if (!wallet) {
            wallet = new Wallet({ userId: userId, balance: 0, transactions: [] });
            await wallet.save();
        }

        
        wallet.transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
        res.status(200).json({
            message:"",
            user,
             wallet,
        }) 
            
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

//create order for razorpay
const createOrderWallet =  async (req, res) => {
    const { amount } = req.body; 
    
   console.log("req",req.body)
    const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: `receipt_order_${Math.random()}`,
      payment_capture: 1,
    };
  
    try {
      const order = await razorpay.orders.create(options);
      res.status(200).json(order);
    } catch (error) {
        console.log(error)
      res.status(500).json({ error: error.message });
    }
  }

const shareKey = ( req, res) => {
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID }); 
  }

//update wallet balance
  const updateWalletBalance = async (req, res) => {
    try {
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

        
        res.status(200).json({ success: true, balance: wallet.balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getWallets,
    transactionDetail,
    showWallet,
    createOrderWallet,
    shareKey,
    updateWalletBalance
}
