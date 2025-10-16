const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const { customError } = require("../../utils/customError");
const { validateCoupon } = require("../validation/coupon.validation");
const couponModel = require("../models/coupon.model");
//create coupon
exports.createCoupon = asyncHandler(async (req, res) => {
  const couponData = await validateCoupon(req);

  const coupon = await couponModel.create({ ...couponData });
  if (!coupon) throw new customError(400, "coupon creation failed");

  apiResponse.sendsuccess(
    res,
    201,
    "coupon has been created successfully",
    coupon
  );
});

//get all coupon

exports.getAllCoupon = asyncHandler(async (req, res) => {
  const getAllCoupon = await couponModel.find().sort({ createdAt: -1 });
  if (!getAllCoupon) throw new customError(400, "coupon not found");

  apiResponse.sendsuccess(res, 200, "All Coupons list", getAllCoupon);
});

//single coupon
exports.singleCoupon = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(400, "slug is missing");

  const singleCoupon = await couponModel.findOne({ slug });
  if (!singleCoupon) throw new customError(400, "coupon not found");

  apiResponse.sendsuccess(res, 200, "Single Coupon Details", singleCoupon);
});

//update coupon

exports.updateCoupon = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(400, "slug is missing");

  const updateCoupon = await couponModel.findOneAndUpdate(
    { slug },
    { ...req.body },
    { new: true }
  );

  if (!updateCoupon) throw new customError(400, "update coupon failed");

  apiResponse.sendsuccess(res, 200, "Coupon has been updated", updateCoupon);
});

//delete coupon

exports.deleteCoupon = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(400, "slug is missing");

  const deleteCoupon = await couponModel.findOneAndDelete({ slug });
  if (!deleteCoupon) throw new customError(400, "deleting coupon failed");

  apiResponse.sendsuccess(res, 200, "Coupon Has Been Deleted", deleteCoupon);
});

//Coupon Status
exports.couponStatus = asyncHandler(async (req, res) => {
  const { status, slug } = req.query;
  if (!status && !slug) throw new customError(400, "status or slug is missing");

  let query = {};
  if (status == "active") {
    query.isActive = true;
  } else {
    query.isActive = false;
  }

  const couponStatus = await couponModel.findOneAndUpdate({ slug }, query, {
    new: true,
  });

  if (!couponStatus)
    throw new customError(400, "coupon status couldn't be updated");

  apiResponse.sendsuccess(
    res,
    200,
    "Coupon Status has been updated",
    couponStatus
  );
});
