const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const { customError } = require("../../utils/customError");
const { redirect } = require("express/lib/response");

//success payment
exports.successPayment = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .redirect(
      "https://cdn.prod.website-files.com/5ef0df6b9272f7410180a013/60c0e28575cd7c21701806fd_q1cunpuhbdreMPFRSFLyfUXNzpqv_I5fz_plwv6gV3sMNXwUSPrq88pC2iJijEV7wERnKXtdTA0eE4HvdnntGo9AHAWn-IcMPKV-rZw1v75vlTEoLF4OdNqsRb7C6r7Mvzrm7fe4.png"
    );
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
