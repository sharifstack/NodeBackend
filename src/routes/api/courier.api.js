const express = require("express");
const _ = express.Router();
const courierController = require("../../controller/courier.controller");

_.route("/create-order-courier").post(courierController.createOrderCourier);
module.exports = _;
