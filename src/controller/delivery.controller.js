const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const { customError } = require("../../utils/customError");
const deliveryModel = require("../models/delivery.model");
const { validateDelivery } = require("../validation/delivery.validation");

//create delivery charge
exports.createDelivery = asyncHandler(async (req, res) => {
  const deliveryData = await validateDelivery(req);

  const delivery = await deliveryModel.create({ ...deliveryData });
  if (!delivery) throw new customError(500, "Failed to create delivery charge");

  apiResponse.sendsuccess(
    res,
    201,
    "Delivery charge created successfully",
    delivery
  );
});

//get all delivery charges
exports.getAllDelivery = asyncHandler(async (req, res) => {
  const getAllDelivery = await deliveryModel.find().sort({ createdAt: -1 });
  if (!getAllDelivery)
    throw new customError(500, "Failed to fetch delivery charges");

  apiResponse.sendsuccess(
    res,
    200,
    "Delivery charges fetched successfully",
    getAllDelivery
  );
});

//get single delivery charge
exports.getSingleDelivery = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(400, "Delivery slug is required");

  const getSingleDelivery = await deliveryModel.findOne({ slug });
  if (!getSingleDelivery)
    throw new customError(500, "Failed to fetch delivery charges");

  apiResponse.sendsuccess(
    res,
    200,
    "Delivery charges fetched successfully",
    getSingleDelivery
  );
});

//update delivery charge
exports.updateDelivery = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(400, "Delivery slug is required");

  for (let parts in req.body) {
    if (
      req.body[parts] === "" ||
      req.body[parts] === null ||
      req.body[parts] === undefined
    ) {
      throw new customError(400, "insert all the fields");
    }
  }

  const updateDelivery = await deliveryModel.findOneAndUpdate(
    { slug },
    { ...req.body },
    { new: true }
  );

  if (!updateDelivery)
    throw new customError(500, "Failed to update delivery charge");
  apiResponse.sendsuccess(
    res,
    200,
    "Delivery charge updated successfully",
    updateDelivery
  );
});

//remove delivery charge

exports.deleteDelivery = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(400, "Delivery slug is required");

  const deleteDelivery = await deliveryModel.findOneAndDelete({ slug });
  if (!deleteDelivery)
    throw new customError(500, "Failed to delete delivery charge");

  apiResponse.sendsuccess(
    res,
    200,
    "Delivery charge deleted successfully",
    deleteDelivery
  );
});
