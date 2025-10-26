const express = require("express");
const _ = express.Router();
const reviewController = require("../../controller/reviews.controller");

_.route("/create-review").post(reviewController.createReview);
_.route("/getall-review").get(reviewController.getAllReview);
_.route("/single-review/:id").get(reviewController.singleReview);
_.route("/update-review/:id").put(reviewController.udpateReview);
_.route("/delete-review/:id").delete(reviewController.deleteReview);

module.exports = _;
