const express = require("express");
const _ = express.Router();
const productController = require("../../controller/product.controller");
const upload = require("../../middleware/multer.middleware");

_.route("/create-product").post(
  upload.fields([{ name: "image", maxCount: 10 }]),
  productController.createProduct
);
_.route("/getall-products").get(productController.getAllProduct);
_.route("/single-product/:slug").get(productController.singleProduct);

module.exports = _;
