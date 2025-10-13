const express = require("express");
const _ = express.Router();
const varinatController = require("../../controller/variant.controller");
const upload = require("../../middleware/multer.middleware");

_.route("/create-variant").post(
  upload.fields([{ name: "image", maxCount: 10 }]),
  varinatController.createVariant
);
_.route("/getall-variant").get(varinatController.getAllVariant);
_.route("/single-variant/:slug").get(varinatController.singleVariant);
_.route("/delete-variant/:slug").delete(varinatController.deleteVariant);
_.route("/update-variant/:slug").put(
  upload.fields([{ name: "image", maxCount: 10 }]),
  varinatController.updateVariantInfo
);

_.route("/update-variantimage/:slug").put(
  upload.fields([{ name: "image", maxCount: 10 }]),
  varinatController.updateVariantImg
);

_.route("/delete-variantimage/:slug").delete(
  upload.fields([{ name: "image", maxCount: 10 }]),
  varinatController.deleteVariantImg
);

module.exports = _;
