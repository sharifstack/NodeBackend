const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const { customError } = require("../../utils/customError");
const { validateWarranty } = require("../validation/warranty.validation");
const warrantyModel = require("../models/warranty.model");
const productModel = require("../models/product.model");

//create warranty

exports.createWarranty = asyncHandler(async (req, res) => {
  const warrantyData = await validateWarranty(req);

  const warranty = await warrantyModel.create({ ...warrantyData });
  if (!warranty) throw new customError(400, "warranty creation failed");

  //pushing warranty into product

  const updateProductInfo = await productModel.findOneAndUpdate(
    {
      _id: warrantyData.product,
    },
    {
      $push: { warranty: warranty._id },
    },
    { new: true }
  );

  if (!updateProductInfo) throw new customError(400, "update Failed");

  apiResponse.sendsuccess(res, 201, "warranty has been created", warranty);
});

//get all warranty
exports.getAllWarranty = asyncHandler(async (req, res) => {
  const warranty = await warrantyModel
    .find()
    .populate("product")
    .sort({ createdAt: -1 });

  if (!warranty) throw new customError(404, "warranty not found");

  apiResponse.sendsuccess(
    res,
    200,
    "here are all warranty informations",
    warranty
  );
});

//get single warranty
exports.getSingleWarranty = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(400, "slug is required");

  const warranty = await warrantyModel
    .findOne({ slug })
    .populate("product")
    .sort({ createdAt: -1 });

  if (!warranty) throw new customError(404, "warranty not found");

  apiResponse.sendsuccess(
    res,
    200,
    "warranty information  has been provided",
    warranty
  );
});

//update warranty
exports.updateWarranty = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(400, "slug is required");

  const updateWarranty = await warrantyModel
    .findOneAndUpdate({ slug }, { ...req.body }, { new: true })
    .populate("product");
  if (!updateWarranty) throw new customError(400, "warranty not found");
  apiResponse.sendsuccess(
    res,
    200,
    "warranty has been updated",
    updateWarranty
  );
});

//delete warranty
exports.deleteWarranty = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(400, "slug is required");

  const deleteWarranty = await warrantyModel.findOneAndDelete({ slug });
  if (!deleteWarranty) throw new customError(400, "warranty not found");

  //updating product info
  const updateProduct = await productModel.findOneAndUpdate(
    {
      _id: deleteWarranty.product,
    },
    { $pull: { warranty: deleteWarranty._id } },
    { new: true }
  );

  if (!updateProduct)
    throw new customError(400, "Updating The Product Info Failed");
  apiResponse.sendsuccess(
    res,
    200,
    "warranty has been deleted successfully",
    deleteWarranty
  );
});
