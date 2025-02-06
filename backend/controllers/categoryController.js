
const Category = require("../models/categoryModel.js");


const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.json({ error: "Name is required" });
    }

    const existingCategory = await Category.findOne({ name });

    if (existingCategory) {
      return res.json({ error: "Already exists" });
    }
    const category = await Category.create({
        name,

    })
    
    res.staus(201).json(category);
  } catch (error) {
    console.log(error);
    return res.status(400).json({message:error.message});
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
    const all = await Category.find({});
    res.json(all);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error.message);
  }
};

//Available categories
const listExistCategory = async(req,res)=>{
    try {
        const categories = await Category.find({ isExist: true });
        res.staus(201).json(categories);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message:error.message });
      }
}
 
//to get a particular category
const readCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id });
    res.status(201).json(category);
  } catch (error) {
    console.log(error);
    return res.status(400).json({message:error.message});
  }
};

module.exports =  {
  createCategory,
  updateCategory,
  deleteCategory,
  listCategory,
  listExistCategory,
  readCategory,
};
