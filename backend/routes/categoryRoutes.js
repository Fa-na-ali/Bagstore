const express = require('express');
const router = express.Router();
const {
    createCategory,
    updateCategory,
    listCategory,
    readCategory,
    deleteCategory,
} = require("../controllers/categoryController.js");

const { authenticate, authorizeAdmin } = require("../middlewares/authMiddleware.js");

router.route("/").post(authenticate, authorizeAdmin, createCategory);
router.route("/:categoryId").put(authenticate, authorizeAdmin, updateCategory);
router
    .route("/:categoryId")
    .delete(authenticate, authorizeAdmin, deleteCategory);

router.route("/categories").get(listCategory);
router.route("/:id").get(readCategory);

module.exports = router;