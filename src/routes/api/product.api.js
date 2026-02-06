const express = require("express");
const _ = express.Router();
const productController = require("../../controller/product.controller");
const upload = require("../../middleware/multer.middleware");

_.route("/create-product").post(
  upload.fields([{ name: "image", maxCount: 10 }]),
  productController.createProduct,
);
_.route("/getall-products").get(productController.getAllProduct);
_.route("/single-product").get(productController.singleProduct);
_.route("/update-product/:slug").put(productController.updateProduct);
_.route("/upload-productimg/:slug").put(
  upload.fields([{ name: "image", maxCount: 10 }]),
  productController.uploadProductImage,
);
_.route("/delete-productimg/:slug").delete(
  upload.fields([{ name: "image", maxCount: 10 }]),
  productController.removeProductImage,
);

_.route("/delete-product/:slug").delete(
  upload.fields([{ name: "image", maxCount: 10 }]),
  productController.deleteProduct,
);

_.route("/search-products").get(productController.searchByProducts);
_.route("/product-pagination").get(productController.pagination);
_.route("/product-pricerange").get(productController.priceRange);
_.route("/product-productodering").get(productController.productOdering);
_.route("/product-productstatus").put(productController.productStatus);


module.exports = _;
