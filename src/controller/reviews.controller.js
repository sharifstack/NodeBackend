const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const { customError } = require("../../utils/customError");
const reviewsModel = require("../models/reviews.model");
const { validateReview } = require("../validation/reviews.validation");
const productModel = require("../models/product.model");
const variantModel = require("../models/variant.model");

//create review
exports.createReview = asyncHandler(async (req, res) => {
  const reviewData = await validateReview(req);

  const userReview = await reviewsModel.create({ ...reviewData });
  if (!userReview) throw new customError(400, "review sumbit failed");

  //pushing the review id into product and variant
  let reviewArray = [];
  if (reviewData.product) {
    reviewArray.push(
      productModel.findOneAndUpdate(
        { _id: reviewData.product },
        {
          $push: { reviews: userReview._id },
        }
      )
    );
  }

  if (reviewData.variant) {
    reviewArray.push(
      variantModel.findOneAndUpdate(
        { _id: reviewData.variant },
        {
          $push: { reviews: userReview._id },
        }
      )
    );
  }

  await Promise.all(reviewArray);

  apiResponse.sendsuccess(res, 201, "review successfully created", userReview);
});

//get all review

exports.getAllReview = asyncHandler(async (req, res) => {
  const getAllReview = await reviewsModel
    .find()
    .populate("reviewer")
    .sort({ createdAt: -1 });

  if (!getAllReview) throw new customError(400, "no reviews found");
  apiResponse.sendsuccess(res, 200, "all reviews", getAllReview);
});

//get single review

exports.singleReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new customError(400, "userid not found");

  const singleReview = await reviewsModel
    .findOne({ _id: id })
    .populate("reviewer");

  if (!singleReview) throw new customError(400, "no reviews found");
  apiResponse.sendsuccess(res, 200, "review  has been found", singleReview);
});

//update review
exports.udpateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new customError(400, "userid not found");

  const udpateReview = await reviewsModel.findOneAndUpdate(
    { _id: id },
    {
      ...req.body,
    },
    {
      new: true,
    }
  );
  if (!udpateReview) throw new customError(400, "updating review failed");
  apiResponse.sendsuccess(res, 200, "review  has been updated", udpateReview);
});

//delete review
exports.deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new customError(400, "userid not found");

  const deleteReview = await reviewsModel.findOneAndDelete({ _id: id });
  if (!deleteReview) throw new customError(400, "no reviews found");

  //removing the review from product and variant
  const updateProduct = await productModel.findOneAndUpdate(
    {
      _id: deleteReview.product,
    },
    { $pull: { reviews: deleteReview._id } },
    { new: true }
  );
  if (!updateProduct) throw new customError(400, "updating product failed");

  //for variant
  const updateVariant = await variantModel.findOneAndUpdate(
    {
      _id: deleteReview.variant,
    },
    { $pull: { reviews: deleteReview._id } },
    { new: true }
  );
  if (!updateVariant) throw new customError(400, "updating variant failed");

  apiResponse.sendsuccess(res, 200, "review  has been deleted", deleteReview);
});
