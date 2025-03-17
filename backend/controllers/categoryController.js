const mongoose = require('mongoose')
const Category = require("../models/categoryModel.js");
const Product = require('../models/productModel.js');
const STATUS_CODES = require('../middlewares/statusCodes.js');
const { USR_ID_MISSING, USR_NAME_RQD, CATEGORY_EXT, CATEGORY_DLT_MSG, CATEGORY_NOT_FOUND } = require('../categoryMsgConstants.js');

//add category
const addCategory = async (req, res) => {
console.log("hhhh")
  try {
    const { name } = req.body;
    if (!req.user?._id) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
         message: USR_ID_MISSING });
    }
  console.log(name)

    if (!name) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ 
        status:"error",
        message:USR_NAME_RQD,
       });
    }

    const existingCategory = await Category.findOne({name: name });
     console.log(existingCategory)
    if (existingCategory) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ 
        status:"error",
        message:CATEGORY_EXT,
       });
    }
    const category = await Category.create({
      name,
      createdBy: req.user._id,
      updatedBy: req.user._id,

    })
    return res.status(STATUS_CODES.OK).json({ 
      status:"success",
     category
     });
  } catch (error) {
    console.log(error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ 
      status:"error",
      message:error.message
     });
    
  }
};
//update category
const updateCategory = async (req, res) => {
  try {
  
    console.log("upadte",req.params)
    const category = await Category.findByIdAndUpdate({_id:req.params.id}, req.body, { new: true });
    if (!category) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ 
        status:"error",
       message:CATEGORY_NOT_FOUND
      })
    }
    else {
      return res.status(STATUS_CODES.OK).json({ 
        status:"success",
        _id: category._id,
        name: category.name,
      })
    }
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ 
      status:"error",
      message:error.message
     });
  }
};
//delete category
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ 
        status:"error",
       message:CATEGORY_NOT_FOUND
      })
      
    }
    category.isExist = false;
    await category.save();
    return res.status(STATUS_CODES.OK).json({ 
      status:"success",
     message:CATEGORY_DLT_MSG,
    })
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ 
      status:"error",
      message:error.message
     });
  }
};

//All categories
const listCategory = async (req, res) => {
  try {
    const all = await Category.find({}).sort({ createdAt: -1 });
    return res.status(STATUS_CODES.OK).json({ 
      status:"success",
      all
    })
  } catch (error) {
    console.log(error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ 
      status:"error",
      message:error.message
     });
  }
};

//Available categories
const listExistCategory = async (req, res) => {
  try {
    const categories = await Category.find({ isExist: true });
    return res.status(STATUS_CODES.OK).json({ 
      status:"success",
      categories
    })
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ 
      status:"error",
      message:error.message
     });
  }
}

//to get a particular category
const readCategory = async (req, res) => {
  try {
    
    const id = req.params.id;
    const category = await Category.findById({_id:id });
    console.log("read",category)
    return res.status(STATUS_CODES.OK).json({ 
      status:"success",
      category
    })
  } catch (error) {
    console.log(error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ 
      status:"error",
      message:error.message
     });
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
    return res.status(STATUS_CODES.OK).json({ 
      status:"success",
      categories,
      count,
      page,
      pages: Math.ceil(count / pageSize),
      hasMore: page < Math.ceil(count / pageSize),
     });
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ 
      status:"error",
      message:error.message
     });
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
      return res.status(STATUS_CODES.OK).json({ 
        status:"success",
        all
       });
    } catch (error) {
      console.log(error);
      return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ 
        status:"error",
        message:error.message
       });
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
