const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const { customError } = require("../../utils/customError");
const orderModel = require("../models/order.model");
const { api } = require("../helpers/axios");
const { default: mongoose } = require("mongoose");

exports.createOrderCourier = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new customError(401, "Invalid Order-Id");
  }

  const order = await orderModel.findById(orderId);
  if (!order) throw new customError(401, "Order Not Found!");

  const { invoiceId, shippinginfo, finalAmount } = order;

  const courierPayload = {
    invoice: invoiceId,
    recipient_name: shippinginfo.firstName,
  };
});
