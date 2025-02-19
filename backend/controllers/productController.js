const express = require('express')
const Product = require('../models/productModel')
const mongoose = require('mongoose')

//add Product
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, quantity, brand, size, color } = req.body;
    const files = req.files;
    console.log(req.body)
    console.log(req.files)

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
      price,
      color,
      pdImage: imageUrls,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    res.status(201).json({ message: "Product added successfully!", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//NEW products
const newProducts = async (req, res) => {
  try {
    const all = await Product.find({}).sort({ createdAt: -1 }).limit(6);
    res.json(all);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error.message);
  }
};




//update product
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, quantity, brand, size, color } = req.body;
    const files = req.files;
    console.log("body", req.body)
    console.log("files", req.files)
    const id = req.params.id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const product = await Product.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true }
    );
    const imageUrls = files.map((file) => file.filename);
    product.pdImage = [...imageUrls]

    if (!product) {
      res.status(404);
      throw new Error(`Product not found with  id ${req.params.id}`);
    }
    else {
      await product.save();
      res.json({ product })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })

  }

};
//delete Image
const deleteImage = async (req, res) => {
  console.log("params", req.params)
  try {
    const { id, index } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const product = await Product.findById(id);
    console.log("prooo", product)
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (index < 0 || index >= product.pdImage.length) {
      return res.status(400).json({ error: "Invalid image index" });
    }

    product.pdImage.splice(index, 1);
    await product.save();

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


//to get a particular product
const readProduct = async (req, res) => {
  try {

    const id = req.params.id;
    const product = await Product.findById({ _id: id });
    console.log("read", product)
    res.status(201).json(product);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
};

//fetch products in the product management with pagination and search

const fetchProducts = async (req, res) => {
  console.log("search")
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
    console.log("count", count)
    const products = await Product.find({ ...keyword }).sort({ createdAt: -1 }).limit(pageSize).skip(pageSize * (page - 1));
    console.log("products", products)
    res.json({
      products,
      count,
      page,
      pages: Math.ceil(count / pageSize),
      hasMore: page < Math.ceil(count / pageSize),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
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

    res.json({
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

//fetch related products
const fetchRelatedProducts = async (req, res) => {
  console.log("fetchrelated")
  try {
    const { id } = req.params;
    console.log(req.params)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const currentProduct = await Product.findById(id);
    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    console.log("currentpro",currentProduct)
    const relatedProducts = await Product.find({
      category: currentProduct.category,
      isExist: true,
      _id: { $ne: currentProduct._id}
    })
      .populate("category")
      .limit(6)
      .sort({ createdAt: -1 });

    res.json(relatedProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
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
      brand,
      color,
      sortBy,
      page = 1,
      limit = 12,
    } = req.query;

    const filters = { isExist: true };


    if (search) {
      filters.name = { $regex: search, $options: "i" };
    }


    if (category) {
      filters.categoryId = category;
    }


    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseInt(minPrice);
      if (maxPrice) filters.price.$lte = parseInt(maxPrice);
    }


    if (brand) {
      filters.brand = brand;
    }

    if (color) {
      filters.color = { $regex: color, $options: "i" };
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
        case "averageRating":
          sortOption.averageRating = -1;
          break;
        case "popularity":
          sortOption.sold = -1;
          break;
        case "featured":
          sortOption.featured = -1;
          break;
        default:
          sortOption.createdAt = -1;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const products = await Product.find(filters)
      .populate("category")
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));
    const totalProducts = await Product.countDocuments(filters);

    res.json({
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
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
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product soft deleted successfully", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { addProduct, 
  newProducts,
   deleteProduct,
    readProduct,
     deleteImage,
      updateProduct, 
      fetchProducts,
    fetchRelatedProducts }


