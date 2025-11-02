const express = require("express");
const _ = express.Router();
const cartController = require("../../controller/cart.controller");

_.route("/addtocart").post(cartController.addToCart);
_.route("/apply-coupon").post(cartController.applyCoupon);
_.route("/increment-quantity").post(cartController.incrementQuantity);
_.route("/decrement-quantity").post(cartController.decrementQuantity);
_.route("/remove-cartitems").delete(cartController.removeCartItems);

module.exports = _;
