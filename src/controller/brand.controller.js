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




//----update brand----//
exports.updateBrand = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(400, "slug is missing");

  const brand = await brandModel.findOne({ slug: slug });
  if (!brand) throw new customError(500, "brand not found");

  // update name
  if (req.body.name) {
    brand.name = req.body.name;
  }

  // update since
  if (req.body.since) {
    brand.since = req.body.since;
  }

  // update image
  if (req.files?.image) {
    // delete old image from cloudinary
    const parts = brand.image.split("/");
    const imageName = parts[parts.length - 1];
    const result = await deleteCloudinaryFile(imageName.split("?")[0]);
    if (result !== "ok") throw new customError(400, "image not deleted");

    // upload new image
    const imageUrl = await uploadCloudinaryFIle(
      req.files.image[0].path
    );
    brand.image = imageUrl;
  }

  await brand.save();

  apiResponse.sendsuccess(res, 200, "brand has been updated", brand);
});

