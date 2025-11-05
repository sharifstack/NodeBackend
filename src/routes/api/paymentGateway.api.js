const express = require("express");
const _ = express.Router();
const paymentController = require("../../controller/paymentGateway.controller");

_.route("/payment-success").post(paymentController.successPayment);
_.route("/payment-fail").post(paymentController.failedPayment);
_.route("/payment-cancel").post(paymentController.cancelPayment);
_.route("/payment-ipn").post(paymentController.ipnPayment);

module.exports = _;
