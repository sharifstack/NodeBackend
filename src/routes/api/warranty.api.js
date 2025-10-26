const express = require("express");
const _ = express.Router();
const warrantyController = require("../../controller/warranty.controller");

_.route("/create-warranty").post(warrantyController.createWarranty);
_.route("/getall-warranty").get(warrantyController.getAllWarranty);
_.route("/single-warranty/:slug").get(warrantyController.getSingleWarranty);
_.route("/update-warranty/:slug").post(warrantyController.updateWarranty);
_.route("/update-warranty/:slug").put(warrantyController.updateWarranty);
_.route("/delete-warranty/:slug").delete(warrantyController.deleteWarranty);

module.exports = _;
