const express = require("express");
const _ = express.Router();
const courierController = require("../../controller/courier.controller");

_.route("/create-order-courier").post(courierController.createOrderCourier);
_.route("/create-bulk-orders").post(courierController.createBulkOrderCourier);
_.route("/check-delivery-status").get(courierController.checkingDeliveryStatus);
_.route("/check-balace").get(courierController.getCurrentBalance);
_.route("/return-request").post(courierController.createReturnRequest);
_.route("/return-request-view").get(courierController.getReturnRequestStatus);
_.route("/steadfastwebhookhandler").post(
  courierController.steadfastWebhookHandler
);
module.exports = _;
