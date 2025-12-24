const express = require("express");
const _ = express.Router();
const categoryController = require("../../controller/category.controller");
const upload = require("../../middleware/multer.middleware");
const { authGuard } = require("../../middleware/authGuard.middleware");

_.route("/create_category").post(
  authGuard,
  upload.fields([{ name: "image", maxCount: 1 }]),
  categoryController.createCategory
);
_.route("/get-all-category").get(categoryController.getAllCategory);
_.route("/singlecategory/:slug").get(categoryController.sinlgeCategory);

_.route("/updatecategory/:slug").put(
  upload.fields([{ name: "image", maxCount: 1 }]),
  categoryController.updateCategory
);
_.route("/deletecategory/:slug").delete(categoryController.deleteCategory);
module.exports = _;
