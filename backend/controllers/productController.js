const Product = require('../models/productModel')
const mongoose = require('mongoose');
const STATUS_CODES = require('../statusCodes');
const { PRODUCT_ADDED, PRODUCT_NOT_FOUND, PRODUCT_DELETED, PRODUCT_INVALID, PRODUCT_IMG_DELETED, PRODUCT_UNBLOCKED } = require('../productMsgConstants');
const User = require('../models/userModel');
const { USER_NOT_MSG } = require('../messageConstants');
const Wishlist = require('../models/wishlistModel');
const asyncHandler = require('../middlewares/asyncHandler');

//add Product
const addProduct = asyncHandler(async (req, res) => {

  const { name, description, price, category, offer, quantity, brand, size, color } = req.body;
  const files = req.files;
  if (!name) {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error("Name is required");
  }
  if (!brand) {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error("Brand is required");
  }
  if (!description) {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error("Description is required");
  }
  if (!price) {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error("Price is required");
  }
  if (!category) {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error("Category is required");
  }
  if (!quantity) {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error("Quantity is required");
  }
  if (!size) {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error("Size is required");
  }
  if (!color) {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error("Color is required");
  }
  if (!files || files.length === 0) {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error("At least three images are required");
  }

  const imageUrls = files.map((file) => file.path);
  const product = await Product.create({
    name,
    description,
    brand,
    category,
    quantity,
    size,
    offer: offer || "",
    price,
    color,
    pdImage: imageUrls,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });
  return res.status(STATUS_CODES.CREATED).json({
    status: "success",
    message: PRODUCT_ADDED,
    product
  })
});

//NEW products
const newProducts = asyncHandler(async (req, res) => {

  const all = await Product.find({}).sort({ createdAt: -1 }).limit(6).populate('category');
  return res.status(STATUS_CODES.OK).json({
    status: "success",
    all
  })
});

//update product
const updateProduct = asyncHandler(async (req, res) => {

  const files = req.files;
  const id = req.params.id
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error(PRODUCT_INVALID)
  }
  const product = await Product.findByIdAndUpdate(
    id,
    { ...req.body },
    { new: true }
  );
  const imageUrls = files.map((file) => file.path);
  product.pdImage = [...imageUrls]

  if (!product) {
    res.status(STATUS_CODES.NOT_FOUND)
    throw new Error(PRODUCT_NOT_FOUND)
  }
  else {
    await product.save();
    return res.status(STATUS_CODES.OK).json({
      status: "success",
      product
    });
  }
});

//delete Image
const deleteImage = asyncHandler(async (req, res) => {

  const { id, index } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error(PRODUCT_INVALID)
  }
  const product = await Product.findById(id);
  if (!product) {
    res.status(STATUS_CODES.NOT_FOUND)
    throw new Error(PRODUCT_NOT_FOUND)
  }
  if (index < 0 || index >= product.pdImage.length) {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error("Invalid image index")
  }

  product.pdImage.splice(index, 1);
  await product.save();
  return res.status(STATUS_CODES.OK).json({
    status: "success",
    message: PRODUCT_IMG_DELETED
  });
});

//to get product quantity
const getQuantity = asyncHandler(async (req, res) => {
  const ids = req.query.ids?.split(",") || [];
  const products = await Product.find({ _id: { $in: ids } });
  return res.status(STATUS_CODES.OK).json({
    status: "success",
    products
  });
});

//to get a particular product
const readProduct = asyncHandler(async (req, res) => {

  const id = req.params.id;
  const product = await Product.findById({ _id: id })
    .select("name category price quantity color brand isExist _id pdImage size description offer")
    .populate("category")
  return res.status(STATUS_CODES.OK).json({
    status: "success",
    product
  });
});

//fetch products in the product management with pagination and search
const fetchProducts = asyncHandler(async (req, res) => {

  const pageSize = 6;
  const page = Number(req.query.page) || 1;
  const keyword = req.query.keyword
    ? {
      name: {
        $regex: req.query.keyword,
        $options: "i",
      },
    }
    : {};

  const count = await Product.countDocuments({ ...keyword });
  const products = await Product.find({ ...keyword })
    .select("name category price quantity color brand isExist _id")
    .populate("category", "name -_id").sort({ createdAt: -1 }).limit(pageSize).skip(pageSize * (page - 1));
  return res.status(STATUS_CODES.OK).json({
    status: "success",
    products,
    count,
    page,
    pages: Math.ceil(count / pageSize),
    hasMore: page < Math.ceil(count / pageSize),
  });
});

//fetch related products
const fetchRelatedProducts = asyncHandler(async (req, res) => {

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error(PRODUCT_INVALID)
  }
  const currentProduct = await Product.findById(id);
  if (!currentProduct) {
    res.status(STATUS_CODES.NOT_FOUND)
    throw new Error(PRODUCT_NOT_FOUND)
  }
  const relatedProducts = await Product.find({
    category: currentProduct.category,
    isExist: true,
    _id: { $ne: currentProduct._id }
  })
    .populate("category")
    .limit(6)
    .sort({ createdAt: -1 });

  return res.status(STATUS_CODES.OK).json({
    status: "success",
    relatedProducts
  });
});

//filtering,sorting and search
const filterProducts = asyncHandler(async (req, res) => {

  const {
    search,
    category,
    minPrice,
    maxPrice,
    color,
    sortBy,
    page,

  } = req.query;

  const limit = req.query.limit || 12;

  const filters = { isExist: true };


  if (search) {
    filters.name = { $regex: search, $options: "i" };
  }


  if (category) {
    const categoriesArray = Array.isArray(category) ? category : [category];
    filters.category = { $in: categoriesArray };
  }


  if (minPrice || maxPrice) {
    filters.price = {};
    if (minPrice) filters.price.$gte = parseInt(minPrice);
    if (maxPrice) filters.price.$lte = parseInt(maxPrice);
  }

  if (color) {
    const colorsArray = Array.isArray(color) ? color : [color];
    filters.color = { $in: colorsArray.map((c) => new RegExp(c, "i")) };
  }

  let sortOption = {};
  if (sortBy) {
    switch (sortBy) {
      case "priceLowHigh":
        sortOption.price = 1;
        break;
      case "priceHighLow":
        sortOption.price = -1;
        break;
      case "nameAsc":
        sortOption.name = 1;
        break;
      case "nameDesc":
        sortOption.name = -1;
        break;
      case "newArrivals":
        sortOption.createdAt = -1;
        break;
    }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const products = await Product.find(filters)
    .populate("category")
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit));
  const totalProducts = await Product.countDocuments(filters);
  return res.status(STATUS_CODES.OK).json({
    status: "success",
    products,
    totalProducts,
    totalPages: Math.ceil(totalProducts / limit),
    currentPage: parseInt(page),
  });
});

//deleting product

const deleteProduct = asyncHandler(async (req, res) => {

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isExist: false },
    { new: true }
  );

  if (!product) {
    res.status(STATUS_CODES.NOT_FOUND)
    throw new Error(PRODUCT_NOT_FOUND)
  }
  return res.status(STATUS_CODES.OK).json({
    status: "SUCCESS",
    message: PRODUCT_DELETED,
  });
});

//unblock product
const unblockProduct = asyncHandler(async (req, res) => {

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isExist: true },
    { new: true }
  );

  if (!product) {
    res.status(STATUS_CODES.NOT_FOUND)
    throw new Error(PRODUCT_NOT_FOUND)
  }
  return res.status(STATUS_CODES.OK).json({
    status: "SUCCESS",
    message: PRODUCT_UNBLOCKED
  });
});

//addto wishlist
const updateWishlist = asyncHandler(async (req, res) => {
  const { productId, color } = req.body;
  const user = await User.findOne({ _id: req.user._id });
  if (!user) {
    res.status(STATUS_CODES.NOT_FOUND)
    throw new Error(USER_NOT_MSG)
  }

  const wishlist = await Wishlist.findOne({ productId });
  if (!wishlist) {
    await Wishlist.create({
      userId: user._id,
      productId,
      color,
    });
    return res.status(STATUS_CODES.OK).json({
      status: 'success',
      message: "Product added to wishlist successfully"
    });
  } else {
    await Wishlist.deleteOne({ productId });
    return res.status(STATUS_CODES.OK).json({
      status: 'success',
      message: "Product removed from wishlist successfully"
    });
  }
});

//load wishlist
const fetchWishlist = asyncHandler(async (req, res) => {

  const userId = req.user._id

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error(USER_NOT_MSG)
  }
  const wishlist = await Wishlist.find({ userId })
    .populate({
      path: "productId",
      populate: {
        path: "category",
        model: "Category",
      },
    });
  if (!wishlist) {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error("wishlist not found")
  }
  return res.status(STATUS_CODES.OK).json({
    status: "sucess",
    message: "",
    wishlist
  });
});

//remove from wishlist
const removeFromWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;
  const wishlist = await Wishlist.findOne({ userId });

  if (!wishlist) {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error("wishlist not found")
  }

  wishlist.products = wishlist?.productId?.filter(
    (id) => id.toString() != productId
  );
  await wishlist.save();
  res.status(STATUS_CODES.OK).json({
    status: "success",
    message: "",
    wishlist
  });
});

module.exports = {
  addProduct,
  newProducts,
  deleteProduct,
  readProduct,
  deleteImage,
  updateProduct,
  fetchProducts,
  fetchRelatedProducts,
  filterProducts,
  getQuantity,
  updateWishlist,
  fetchWishlist,
  removeFromWishlist,
  unblockProduct
}


