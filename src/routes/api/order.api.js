const express = require("express");
const _ = express.Router();
const orderController = require("../../controller/order.controller");
_.route("/create-order").post(orderController.createOrder);
_.route("/getall-order").get(orderController.getAllOrders);
_.route("/order-status").get(orderController.getOrderStatus);
_.route("/update-order/:id").put(orderController.updateOrderById);
_.route("/courierpending-status").get(orderController.courierPendingStatus);
module.exports = _;
