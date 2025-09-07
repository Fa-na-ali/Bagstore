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
    unblockCategory,
} = require("../controllers/categoryController.js");
const { authenticate, authorizeAdmin } = require("../middlewares/authMiddleware.js");

//category routes
router.route("/").get(authenticate, authorizeAdmin, fetchCategories)
router.route('/all').get(authenticate, listCategory)
router.route("/").post(authenticate, authorizeAdmin, addCategory);
router.route("/:id").get(authenticate, authorizeAdmin, readCategory)
    .put(authenticate, authorizeAdmin, updateCategory)
    .delete(authenticate, authorizeAdmin, deleteCategory)
router.route("/:id/unblock").put(authenticate, authorizeAdmin, unblockCategory)
router.route("/search/:search").get(authenticate, authorizeAdmin, searchCategory)


module.exports = router;