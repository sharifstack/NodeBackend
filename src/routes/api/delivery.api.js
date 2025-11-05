const express = require("express");
const _ = express.Router();
const deliveryController = require("../../controller/delivery.controller");

_.route("/create-delivery").post(deliveryController.createDelivery);
_.route("/getall-delivery").get(deliveryController.getAllDelivery);
_.route("/single-delivery/:slug").get(deliveryController.getSingleDelivery);
_.route("/update-delivery/:slug").put(deliveryController.updateDelivery);
_.route("/delete-delivery/:slug").delete(deliveryController.deleteDelivery);

module.exports = _;
