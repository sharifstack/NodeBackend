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

module.exports = _;
