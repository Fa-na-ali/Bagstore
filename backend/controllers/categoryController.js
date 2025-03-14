const mongoose = require('mongoose')
const Category = require("../models/categoryModel.js");
const Product = require('../models/productModel.js');

//add category
const addCategory = async (req, res) => {
console.log("hhhh")
  try {
    const { name } = req.body;
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized, user ID missing" });
    }
  console.log(name)

    if (!name) {
      return res.json({ error: "Name is required" });
    }

    const existingCategory = await Category.findOne({name: name });
     console.log(existingCategory)
    if (existingCategory) {
      return res.json({ message: "Already exists" });
    }
    const category = await Category.create({
      name,
      createdBy: req.user._id,
      updatedBy: req.user._id,

    })

    res.status(201).json(category);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
};
//update category
const updateCategory = async (req, res) => {
  try {
  
    console.log("upadte",req.params)
    const category = await Category.findByIdAndUpdate({_id:req.params.id}, req.body, { new: true });
    if (!category) {
      res.status(404);
      throw new Error(`Category not found with  id ${req.params.id}`);
    }
    else {
      res.json({
        _id: category._id,
        name: category.name,
      })
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
//delete category
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    category.isExist = false;
    await category.save();

    res.json({ message: "Category deleted successfully (soft delete)", category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

//All categories
const listCategory = async (req, res) => {
  try {
    const all = await Category.find({}).sort({ createdAt: -1 });
    res.json(all);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error.message);
  }
};

//Available categories
const listExistCategory = async (req, res) => {
  try {
    const categories = await Category.find({ isExist: true });
    res.staus(201).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}

//to get a particular category
const readCategory = async (req, res) => {
  try {
    
    const id = req.params.id;
    const category = await Category.findById({_id:id });
    console.log("read",category)
    res.status(201).json(category);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error.message });
  }
};
//fetch categories on search and pagination
const fetchCategories = async (req, res) => {
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

    const count = await Category.countDocuments({ ...keyword });
    console.log("count", count)
    const categories = await Category.find({ ...keyword }).sort({ createdAt: -1 }).limit(pageSize).skip(pageSize * (page - 1));
    console.log("products", categories)
    res.json({
      categories,
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


//search category
const searchCategory = async (req, res) => {
  console.log("hiii")
  const search = new RegExp(req.params?.search, 'i')
  if (search !== '')
    try {
      const all = await Category.find({ name: search });
      console.log("search", all)
      res.status(200).json(all)
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: error.message });
    }
};

module.exports = {
  addCategory,
  updateCategory,
  deleteCategory,
  fetchCategories,
  readCategory,
  listCategory,
  listExistCategory,
  searchCategory
};
