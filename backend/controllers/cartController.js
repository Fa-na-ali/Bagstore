const asyncHandler = require('../middlewares/asyncHandler');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Offer = require("../models/offerModel");
const Category = require('../models/categoryModel');
const Cart = require('../models/cartModel');
const STATUS_CODES = require('../statusCodes');

//Add to cart
const addToCart = asyncHandler(async (req, res) => {

    const { productId, qty } = req.body;

    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error("User not found")
    }

    const product = await Product.findOne({ _id: productId });

    if (!product) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error('Product not found');
    }
    const category = await Category.findOne({ _id: product.category });

    if (product.quantity < qty) {
        res.status(STATUS_CODES.BAD_REQUEST)
        throw new Error('Insufficient quantity in stock');
    }

    let offer = await Offer.findOne({ name: product.offer });
    if (!offer) {
        let offers = await Offer.find({ type: 'category', status: true });
        let category = await Category.findOne({ _id: product.category });
        offers.forEach((cate_offer) => {
            if (category.offer == cate_offer.name) {
                offer = cate_offer;
            }
        })
    }
    
    let cartOptions;
    if (offer) {
        cartOptions = {
            user: user.id,
            product: product._id,
            name: product.name,
            price: product.price,
            category: category.name,
            qty,
            originalQuantity: product.quantity,
            color: product.color,
            image: product.pdImage[0],
            discount: (qty * (product.price * offer.discount / 100)).toFixed(2),
        };
    } else {
        cartOptions = {
            user: user.id,
            product: product._id,
            name: product.name,
            price: product.price,
            category: category.name,
            qty,
            originalQuantity: product.quantity,
            color: product.color,
            image: product.pdImage[0],
            discount: 0
        };
    }

    await Cart.create(cartOptions);
    return res.status(STATUS_CODES.CREATED).json({ status: 'success', message: 'Product added to cart successfully' });
});

//remove from cart
const removeFromCart = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const user = await User.findOne({ _id: req.user._id });
    if (!user) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error("User not found")
    }
    await Cart.deleteOne({ user: user._id, _id: id });
    return res.status(STATUS_CODES.OK).json({ status: 'success', message: `Product removed from cart successfully` });
});

//update cart quantity
const updateCartQuantity = asyncHandler(async (req, res) => {

    const { cartId, qty } = req.body;
    const cart = await Cart.findOne({ _id: cartId });
    if (!cart) {
        res.status(STATUS_CODES.NOT_FOUND)
        throw new Error("Cart not found");
    }
    await Cart.updateOne({ _id: cartId }, { $set: { qty: qty } })
    return res.status(STATUS_CODES.OK).json({ status: 'success', message: "Cart quantity updated successfully" });
});

//fetch cart items
const loadCarts = asyncHandler(async (req, res) => {

    const carts = await Cart.find({ user: req.user._id }).sort({ createdAt: -1 })
    return res.status(STATUS_CODES.OK).json({ status: 'success', carts });

});

module.exports = {
    addToCart,
    removeFromCart,
    loadCarts,
    updateCartQuantity,
}