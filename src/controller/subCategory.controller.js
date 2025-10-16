const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const { customError } = require("../../utils/customError");
const subCategoryModel = require("../models/subCategory.model");
const categoryModel = require("../models/category.model");
const { validateSubCategory } = require("../validation/subCategory.validation");
const couponModel = require("../models/coupon.model");

//Create Sub_Category
exports.createSubcategory = asyncHandler(async (req, res) => {
  const value = await validateSubCategory(req);
  const subCategoryInstance = await subCategoryModel.create(value);
  if (!subCategoryInstance)
    throw new customError(500, "subCategory Creation Failed");

  await categoryModel.findOneAndUpdate(
    { _id: value.category },
    { $push: { subCategory: subCategoryInstance } },
    { new: true }
  );
  apiResponse.sendsuccess(
    res,
    201,
    "subcategory creation successfull",
    subCategoryInstance
  );
});

//get-all Sub_Category
exports.getAllSubcategory = asyncHandler(async (req, res) => {
  const subCategory = await subCategoryModel
    .find()
    .populate("category")
    .sort({ createdAt: -1 });
  if (!subCategory) throw new customError(500, "subCategory retrive Failed");
  apiResponse.sendsuccess(
    res,
    201,
    "subcategory retrive successfull",
    subCategory
  );
});

//single Sub_Category
exports.singleSubcategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(500, "slug creation failed");
  const subCategory = await subCategoryModel
    .findOne({ slug: slug })
    .populate("category")
    .sort({ createdAt: -1 });
  if (!subCategory) throw new customError(500, "subCategory retrive Failed");
  apiResponse.sendsuccess(
    res,
    201,
    "subcategory retrive successfull",
    subCategory
  );
});
//update Sub_Category
exports.updateSubcategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(500, "slug creation failed");
  const subCategory = await subCategoryModel.findOneAndUpdate(
    { slug: slug },
    { ...req.body },
    { new: true }
  );
  if (!subCategory) throw new customError(500, "subCategory update Failed");
  apiResponse.sendsuccess(
    res,
    201,
    "subcategory update successfull",
    subCategory
  );
});
//delete Sub_Category
exports.deleteSubcategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(500, "slug creation failed");
  const subCategoryInstance = await subCategoryModel.findOneAndDelete({
    slug: slug,
  });
  if (!subCategoryInstance)
    throw new customError(500, "subCategory delete Failed");

  await categoryModel.findByIdAndUpdate(
    { _id: subCategoryInstance.category },
    { $pull: { subCategory: subCategoryInstance._id } },
    { new: true }
  );
  apiResponse.sendsuccess(
    res,
    201,
    "subcategory delete successfull",
    subCategoryInstance
  );
});

