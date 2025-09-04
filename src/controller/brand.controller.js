const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const { customError } = require("../../utils/customError");
const brandModel = require("../models/brand.model");
const { validateBrand } = require("../validation/brand.validation");
const {
  uploadCloudinaryFIle,
  deleteCloudinaryFile,
} = require("../helpers/cloudinary");

//----create brand----//
exports.createBrand = asyncHandler(async (req, res) => {
  const data = await validateBrand(req);

  const imageId = await uploadCloudinaryFIle(data?.image?.path);
  if (!imageId) throw new customError(500, "image not found");
  const brand = await brandModel.create({ ...data, image: imageId });
  if (!brand) throw new customError(500, "brand creation failed");
  apiResponse.sendsuccess(res, 201, "brand creation successfull", brand);
});

//----get all brand----//
exports.getAllBrand = asyncHandler(async (req, res) => {
  const allBrand = await brandModel.find();
  if (!allBrand) throw new customError(500, "brand not found");
  apiResponse.sendsuccess(res, 200, "brand retrive successfull", allBrand);
});

//----get single brand----//
exports.singleBrand = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(500, "slug is missing");

  const singleBrand = await brandModel.findOne({ slug: slug });
  if (!singleBrand) throw new customError(500, "brand not found");

  apiResponse.sendsuccess(res, 200, "brand has been found!", singleBrand);
});


