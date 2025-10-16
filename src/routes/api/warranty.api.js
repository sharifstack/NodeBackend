const express = require("express");
const _ = express.Router();
const warrantyController = require("../../controller/warranty.controller")

_.route("/create-warranty").post(warrantyController.createWarranty)


module.exports = _;