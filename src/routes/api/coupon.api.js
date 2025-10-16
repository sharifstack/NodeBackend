const express = require("express");
const _ = express.Router();
const couponController = require("../../controller/coupon.controller");

_.route("/create-coupon").post(couponController.createCoupon);
_.route("/getall-coupon").get(couponController.getAllCoupon);
_.route("/single-coupon/:slug").get(couponController.singleCoupon);
_.route("/update-coupon/:slug").put(couponController.updateCoupon);
_.route("/delete-coupon/:slug").delete(couponController.deleteCoupon);
_.route("/status-coupon").put(couponController.couponStatus);

module.exports = _;
