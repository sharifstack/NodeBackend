const express = require("express");
const _ = express.Router();
const cartController = require("../../controller/cart.controller");

_.route("/addtocart").post(cartController.addToCart);
_.route("/apply-coupon").post(cartController.applyCoupon);

module.exports = _;
