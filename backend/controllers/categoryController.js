const mongoose = require('mongoose')
const Category = require("../models/categoryModel.js");
const Product = require('../models/productModel.js');
const STATUS_CODES = require('../statusCodes.js');
const { USR_ID_MISSING, USR_NAME_RQD, CATEGORY_EXT, CATEGORY_DLT_MSG, CATEGORY_NOT_FOUND } = require('../categoryMsgConstants.js');
const asyncHandler = require('../middlewares/asyncHandler.js');

//add category
const addCategory = asyncHandler(async (req, res) => {

  const { name, offer } = req.body;
  if (!name) {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error(USR_NAME_RQD)

  }
  const existingCategory = await Category.findOne({ name: name });
  if (existingCategory) {
    res.status(STATUS_CODES.BAD_REQUEST)
    throw new Error(CATEGORY_EXT)

  }
  const category = await Category.create({
    name,
    offer,
    createdBy: req.user._id,
    updatedBy: req.user._id,

  })
  return res.status(STATUS_CODES.OK).json({
    status: "success",
    category
  });
})

//update category
const updateCategory = asyncHandler(async (req, res) => {

  const category = await Category.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true });
  if (!category) {
    res.status(STATUS_CODES.NOT_FOUND)
    throw new Error(CATEGORY_NOT_FOUND)

  }
  else {
    return res.status(STATUS_CODES.OK).json({
      status: "success",
      _id: category._id,
      name: category.name,
    })
  }
})

//delete category
const deleteCategory = asyncHandler(async (req, res) => {

  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(STATUS_CODES.NOT_FOUND)
    throw new Erro(CATEGORY_NOT_FOUND)
  }
  category.isExist = false;
  await category.save();
  return res.status(STATUS_CODES.OK).json({
    status: "success",
    message: CATEGORY_DLT_MSG,
  })

});

//All categories
const listCategory = asyncHandler(async (req, res) => {

  const all = await Category.find({}).sort({ createdAt: -1 });
  return res.status(STATUS_CODES.OK).json({
    status: "success",
    all
  })

});

//Available categories
const listExistCategory = asyncHandler(async (req, res) => {

  const categories = await Category.find({ isExist: true });
  return res.status(STATUS_CODES.OK).json({
    status: "success",
    categories
  })

})

//to get a particular category
const readCategory = asyncHandler(async (req, res) => {

  const id = req.params.id;
  const category = await Category.findById({ _id: id });
  return res.status(STATUS_CODES.OK).json({
    status: "success",
    category
  })
});

//fetch categories on search and pagination
const fetchCategories = asyncHandler(async (req, res) => {

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
  const categories = await Category.find({ ...keyword }).sort({ createdAt: -1 }).limit(pageSize).skip(pageSize * (page - 1));
  return res.status(STATUS_CODES.OK).json({
    status: "success",
    categories,
    count,
    page,
    pages: Math.ceil(count / pageSize),
    hasMore: page < Math.ceil(count / pageSize),
  });
});


//search category
const searchCategory = asyncHandler(async (req, res) => {
  const search = new RegExp(req.params?.search, 'i')
  if (search !== '') {
    const all = await Category.find({ name: search });
    return res.status(STATUS_CODES.OK).json({
      status: "success",
      all
    });
  }
});

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
