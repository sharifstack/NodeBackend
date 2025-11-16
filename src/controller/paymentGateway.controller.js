const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const { customError } = require("../../utils/customError");
const SSLCommerzPayment = require("sslcommerz-lts");
const orderModel = require("../models/order.model");
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = process.env.NODE_ENV === "development" ? false : true;

//success payment
exports.successPayment = asyncHandler(async (req, res) => {
  const { val_id } = req.body;
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  const validatePayment = await sslcz.validate({
    val_id: val_id,
  });

  console.log("validatePayment", validatePayment);
  if (validatePayment.status !== "VALID")
    throw new customError(400, "Payment validation failed");
  orderModel.findOneAndUpdate(
    { transactionId: validatePayment.tran_id },
    { paymentStatus: validatePayment.status ? "VALID" : "success" }
  );

  apiResponse.sendsuccess(res, 200, "payment successful", null);
});

//failed payment
exports.failedPayment = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .redirect(
      "https://static.vecteezy.com/system/resources/previews/014/778/529/non_2x/payment-error-failed-online-money-transaction-free-vector.jpg"
    );
});

//success payment
exports.cancelPayment = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .redirect(
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4RaW-KwePDX12Wrxp3zlrfq6FoBBNWuSkCA&s"
    );
});

//success payment
exports.ipnPayment = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .redirect(
      "https://paymattic.com/wp-content/uploads/2022/06/Edit-Settings.webp"
    );
});
