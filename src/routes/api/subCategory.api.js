const express = require("express");
const _ = express.Router();
const subCategoryController = require("../../controller/subCategory.controller");

_.route("/create-subcategory").post(subCategoryController.createSubcategory);
_.route("/all-subcategory").get(subCategoryController.getAllSubcategory);
_.route("/single-subcategory/:slug").get(
  subCategoryController.singleSubcategory
);
_.route("/update-subcategory/:slug").put(
  subCategoryController.updateSubcategory
);
_.route("/delete-subcategory/:slug").delete(
  subCategoryController.deleteSubcategory
);

module.exports = _;
