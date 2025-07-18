const express = require('express');
const router = express.Router();
const {
    addCategory,
    updateCategory,
    listCategory,
    deleteCategory,
    searchCategory,
    readCategory,
    fetchCategories,
} = require("../controllers/categoryController.js");

const { authenticate, authorizeAdmin } = require("../middlewares/authMiddleware.js");


router.route("/").get(authenticate, authorizeAdmin,fetchCategories)
router.route('/all').get(authenticate,listCategory)
router.route("/").post( authenticate, authorizeAdmin, addCategory);
router.route("/:id").get(authenticate, authorizeAdmin,readCategory)
.put(authenticate, authorizeAdmin, updateCategory)
.delete(authenticate, authorizeAdmin, deleteCategory)
router.route("/search/:search").get(authenticate, authorizeAdmin,searchCategory)


module.exports = router;