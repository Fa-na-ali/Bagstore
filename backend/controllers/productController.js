const express = require('express')
const Product = require('../models/productModel')
const mongoose = require('mongoose');
const STATUS_CODES = require('../middlewares/statusCodes');
const { PRODUCT_ADDED, PRODUCT_NOT_FOUND, PRODUCT_DELETED, PRODUCT_INVALID, PRODUCT_IMG_DELETED } = require('../productMsgConstants');
const User = require('../models/userModel');
const { USER_NOT_MSG } = require('../messageConstants');
const Wishlist = require('../models/wishlistModel');
const Offer = require('../models/offerModel');
const Category = require('../models/categoryModel');

//add Product
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, offer, quantity, brand, size, color } = req.body;
    const files = req.files;
    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!brand) return res.status(400).json({ error: "Brand is required" });
    if (!description) return res.status(400).json({ error: "Description is required" });
    if (!price) return res.status(400).json({ error: "Price is required" });
    if (!category) return res.status(400).json({ error: "Category is required" });
    if (!quantity) return res.status(400).json({ error: "Quantity is required" });
    if (!size) return res.status(400).json({ error: "Size is required" });
    if (!color) return res.status(400).json({ error: "Color is required" });
    if (!files || files.length === 0) return res.status(400).json({ message: "At least three images are required" });

    const imageUrls = files.map((file) => file.filename);
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
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: error.message
    });
  }
};

//NEW products
const newProducts = async (req, res) => {
  try {
    const all = await Product.find({}).sort({ createdAt: -1 }).limit(6).populate('category');
    return res.status(STATUS_CODES.OK).json({
      status: "success",
      all
    })
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: error.message
    });
  }
};

//update product
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, quantity, brand, size, color } = req.body;
    const files = req.files;
    const id = req.params.id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        status: "error",
        message: PRODUCT_INVALID
      })
    }
    const product = await Product.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );
    const imageUrls = files.map((file) => file.filename);
    product.pdImage = [...imageUrls]

    if (!product) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        status: "error",
        message: PRODUCT_NOT_FOUND
      });

    }
    else {
      await product.save();
      return res.status(STATUS_CODES.OK).json({
        status: "success",
        product
      });
    }
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: error.message
    });

  }

};
//delete Image
const deleteImage = async (req, res) => {

  try {
    const { id, index } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        status: "error",
        message: PRODUCT_INVALID
      })
    }
    const product = await Product.findById(id);
    if (!product)
      return res.status(STATUS_CODES.NOT_FOUND).json({
        status: "error",
        message: PRODUCT_NOT_FOUND
      });


    if (index < 0 || index >= product.pdImage.length) {
      return res.status(400).json({ error: "Invalid image index" });
    }

    product.pdImage.splice(index, 1);
    await product.save();
    return res.status(STATUS_CODES.OK).json({
      status: "success",
      message: PRODUCT_IMG_DELETED
    });
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: error.message
    });
  }
}

//to get product quantity
const getQuantity = async (req, res) => {
  const ids = req.query.ids?.split(",") || [];
  try {
    const products = await Product.find({ _id: { $in: ids } });
    return res.status(STATUS_CODES.OK).json({
      status: "success",
      products
    });
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: error.message
    });
  }
}

//to get a particular product
const readProduct = async (req, res) => {
  try {

    const id = req.params.id;
    const product = await Product.findById({ _id: id }).populate("category")
    return res.status(STATUS_CODES.OK).json({
      status: "success",
      product
    });
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: error.message
    });
  }
};

//fetch products in the product management with pagination and search
const fetchProducts = async (req, res) => {

  try {
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
    const products = await Product.find({ ...keyword }).populate("category", "name -_id").sort({ createdAt: -1 }).limit(pageSize).skip(pageSize * (page - 1));
    return res.status(STATUS_CODES.OK).json({
      status: "success",
      products,
      count,
      page,
      pages: Math.ceil(count / pageSize),
      hasMore: page < Math.ceil(count / pageSize),
    });
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: error.message
    });
  }
};

//fetch all products
const fetchAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const skip = (page - 1) * limit;
    const products = await Product.find({})
      .populate("category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalProducts = await Product.countDocuments({});
    return res.status(STATUS_CODES.OK).json({
      status: "success",
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page
    });

  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: error.message
    });
  }
};

//fetch related products
const fetchRelatedProducts = async (req, res) => {

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        status: "error",
        message: PRODUCT_INVALID
      })
    }
    const currentProduct = await Product.findById(id);
    if (!currentProduct) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        status: "error",
        message: PRODUCT_NOT_FOUND
      });

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
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: error.message
    });
  }
};

//filtering,sorting and search
const filterProducts = async (req, res) => {

  try {
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
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: error.message
    });
  }
};

//deleting product

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isExist: false },
      { new: true }
    );

    if (!product) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        status: "error",
        message: PRODUCT_NOT_FOUND
      });

    }
    return res.status(STATUS_CODES.OK).json({
      status: "SUCCESS",
      message: PRODUCT_DELETED,
      product
    });
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: error.message
    });
  }
};

//addto wishlist
const updateWishlist = async (req, res) => {
  const { productId, color } = req.body;
  const user = await User.findOne({ _id: req.user._id });
  if (!user) {
    return res.status(STATUS_CODES.NOT_FOUND).json({
      status: 'error',
      message: USER_NOT_MSG
    });
  }

  const wishlist = await Wishlist.findOne({ productId });
  if (!wishlist) {
    const new_wishlist = await Wishlist.create({
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
};

//load wishlist
const fetchWishlist = async (req, res) => {

  try {
    const userId = req.user._id

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        status: "error",
        message: USER_NOT_MSG
      })
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
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        status: "error",
        message: "wishlist not found"
      });
    }
    return res.status(STATUS_CODES.OK).json({
      status: "sucess",
      message: "",
      wishlist
    });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Server error", error
    });
  }
};

//remove from wishlist
const removeFromWishlist = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  try {

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        status: "error",
        message: "wishlist not found"
      });
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
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Server error", error
    });
  }
};

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
}


