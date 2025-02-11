const express = require('express')
const Product = require('../models/productModel')

//add Product
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, quantity, brand, size } = req.body;
    const files = req.files; 

   
    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!brand) return res.status(400).json({ error: "Brand is required" });
    if (!description) return res.status(400).json({ error: "Description is required" });
    if (!price) return res.status(400).json({ error: "Price is required" });
    if (!category) return res.status(400).json({ error: "Category is required" });
    if (!quantity) return res.status(400).json({ error: "Quantity is required" });
    if (!size) return res.status(400).json({ error: "Size is required" });
    if (!files || files.length === 0) return res.status(400).json({ error: "At least three images are required" });

    
    const imageUrls = files.map((file) => file.filename);

    
    const product = await Product.create({
      name,
      description,
      brand,
      category,
      quantity,
      size,
      price,
      pdImage: imageUrls, 
    });

    res.status(201).json({ message: "Product added successfully!", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};




//update product
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, quantity, brand, size } = req.fields;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.fields },
      { new: true }
    );
    if (!user) {
      res.status(404);
      throw new Error(`Product not found with  id ${req.params.id}`);
    }
    else {
      res.json({ product })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })

  }

};

//fetch products 

const fetchProducts = async (req, res) => {
  try {
    const pageSize = 6;

    const keyword = req.query.keyword
      ? {
        name: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
      : {};

    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword }).limit(pageSize);

    res.json({
      products,
      page: 1,
      pages: Math.ceil(count / pageSize),
      hasMore: false,
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
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const products = await Product.find({ isExist: true })
      .populate("category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalProducts = await Product.countDocuments({ isExist: true });

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

const fetchRelatedProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    const relatedProducts = await Product.find({
      category: currentProduct.category,
      isExist: true,
      _id: { $ne: productId }
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

const removeProduct = async (req, res) => {
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

module.exports = {addProduct}


