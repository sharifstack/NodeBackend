const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const { customError } = require("../../utils/customError");
const variantModel = require("../models/variant.model");
const { validateVariant } = require("../validation/variant.validation");
const {
  uploadCloudinaryFIle,
  deleteCloudinaryFile,
  PublicId,
} = require("../helpers/cloudinary");
const productModel = require("../models/product.model");

//create variant
exports.createVariant = asyncHandler(async (req, res) => {
  const variantData = await validateVariant(req);

  //upload all images into cloudinary
  const imageUrl = await Promise.all(
    req.files.image.map((singleImg) => uploadCloudinaryFIle(singleImg.path))
  );

  //saving the created variant into database
  const variant = await variantModel.create({
    ...variantData,
    image: imageUrl,
  });
  if (!variant) throw new customError(500, "variant creation failed.");

  //push the varinat into the product model
  const updatingProduct = await productModel.findByIdAndUpdate(
    {
      _id: variantData.product,
    },
    { $push: { variant: variant._id } },
    { new: true }
  );

  if (!updatingProduct)
    throw new customError(500, "Product not found with this id");

  apiResponse.sendsuccess(
    res,
    201,
    "Variant has been created sucessfully",
    variant
  );
});

//get all variant
exports.getAllVariant = asyncHandler(async (req, res) => {
  const variant = await variantModel
    .find({})
    .populate("product")
    .sort({ createdAt: -1 });

  if (!variant) throw new customError(400, "No variant found");

  apiResponse.sendsuccess(res, 200, "All variant list", variant);
});

//get single variant
exports.singleVariant = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(400, "slug is required");

  const singleVariant = await variantModel
    .findOne({ slug })
    .populate("product");

  if (!singleVariant) throw new customError(400, "variant not found");

  apiResponse.sendsuccess(res, 200, "Single variant details", singleVariant);
});

//update variant info

exports.updateVariantInfo = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(400, "slug is missing");

  const data = req.body;

  for (let field in data) {
    if (data[field] == "" || undefined || null) {
      throw new customError(400, `${field} is missing`);
    }
  }
  const variant = await variantModel.findOne({ slug });
  if (!variant) throw new customError(400, "variant update failed");

  const isMatching = data.product !== variant._id;
  if (!isMatching) {
    productModel.findOneAndUpdate(
      { _id: variant.product },
      { $pull: { variant: variant._id } }
    );
  } else {
    productModel.findOneAndUpdate(
      { _id: data.product },
      { $push: { variant: variant._id } }
    );
  }

  const updatingVarinatInfo = await variantModel.findOneAndUpdate(
    { slug },
    { ...data },
    {
      new: true,
    }
  );

  if (!updatingVarinatInfo)
    throw new customError(400, "updatingVarinat failed");

  apiResponse.sendsuccess(
    res,
    201,
    "Variant has been updated successfully",
    updatingVarinatInfo
  );
});

//update variant img

exports.updateVariantImg = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(400, "slug is required");

  const variant = await variantModel.findOne({ slug: slug });
  console.log(variant);
  if (!variant) throw new customError(400, "Variant Not Found");

  const imgUrl = await Promise.all(
    req.files.image.map((img) => uploadCloudinaryFIle(img.path))
  );

  const updatevariant = await variantModel.findOneAndUpdate(
    { slug },
    {
      $push: { image: imgUrl },
    },
    { new: true }
  );
  apiResponse.sendsuccess(
    res,
    200,
    "Variant image has been updated",
    updatevariant
  );
});

//delete variant img

exports.deleteVariantImg = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(400, "slug is required");

  const { image_Id } = req.body;

  if (!image_Id || !image_Id.length)
    throw new customError(401, "Image ID is Missing");

  const variant = await variantModel.findOne({ slug });
  if (!variant) throw new customError(400, "variant not found");

  const updatedImageList = await variant.image.filter(
    (image) => image !== image_Id
  );

  const deleteimg = await Promise.all(
    [image_Id].map((imgUrl) => {
      return deleteCloudinaryFile(PublicId(imgUrl));
    })
  );

  if (!deleteimg) throw new customError(400, "Image deletion failed");
  variant.image = updatedImageList;
  await variant.save();

  apiResponse.sendsuccess(res, 200, "Image has been deleted", variant);
});

//delete variant
exports.deleteVariant = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(400, "slug is required");

  const deleteVariant = await variantModel.findOneAndDelete({ slug });
  if (!deleteVariant) throw new customError(400, "variant not found");

  //removing the variant id from the product model
  const updatingProduct = await productModel.findByIdAndUpdate(
    {
      _id: deleteVariant.product,
    },
    { $pull: { variant: deleteVariant._id } },
    { new: true }
  );

  if (!updatingProduct)
    throw new customError(500, "Product not found with this id");

  apiResponse.sendsuccess(
    res,
    200,
    "Variant has been deleted successfully",
    deleteVariant
  );
});
