const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const { customError } = require("../../utils/customError");
const { validateDiscount } = require("../validation/discount.validation");
const discountModel = require("../models/discount.model");
const categoryModel = require("../models/category.model");
const subCategoryModel = require("../models/subCategory.model");

//create discount controller
exports.createDiscount = asyncHandler(async (req, res) => {
  const value = await validateDiscount(req);

  //save into databse
  const discountItem = await discountModel.create({ ...value });
  if (!discountItem) throw new customError(500, "discount creation failed");

  //update category with discount id if discount plan is category
  if (discountItem.discountPlan == "category") {
    await categoryModel.findOneAndUpdate(
      { _id: discountItem.targetCategory },
      { $addToSet: { discount: discountItem._id } }
    );
  }

  //update subcategory with discount id if discount plan is subcategory
  if (discountItem.discountPlan == "subcategory") {
    await subCategoryModel.findOneAndUpdate(
      { _id: discountItem.targetSubCategory },
      { $addToSet: { discount: discountItem._id } }
    );
  }

  apiResponse.sendsuccess(res, 201, "discount created", discountItem);
});

//get all discount controller
exports.getAllDiscounts = asyncHandler(async (req, res) => {
  const alldiscounts = await discountModel
    .find()
    .populate("targetCategory targetSubCategory")
    .sort({ createdAt: -1 });
  apiResponse.sendsuccess(res, 200, "all discounts", alldiscounts);
});

//get single discount controller
exports.getSingleDiscount = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(400, "slug is missing");

  const singleDiscount = await discountModel
    .findOne({ slug: slug })
    .populate("targetCategory targetSubCategory");
  if (!singleDiscount) throw new customError(404, "discount not found");
  apiResponse.sendsuccess(res, 200, "single discount", singleDiscount);
});

//update discount controller
exports.updateDiscount = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(400, "slug is missing");

  const newValue = await validateDiscount(req);

  const oldDiscount = await discountModel.findOne({ slug: slug });
  if (!oldDiscount) throw new customError(404, "discount not found");

  const updatedDiscount = await discountModel.findOneAndUpdate(
    { slug },
    newValue,
    { new: true, runValidators: true }
  );

  if (!updatedDiscount) throw new customError(500, "discount update failed");

  //updating category
  if (
    oldDiscount.discountPlan === "category" &&
    oldDiscount.targetCategory?.toString() !==
      updatedDiscount.targetCategory?.toString()
  ) {
    //remove discount id from old category
    await categoryModel.findByIdAndUpdate(oldDiscount.targetCategory, {
      discount: null,
    });

    //add discount id to new category
    await categoryModel.findByIdAndUpdate(updatedDiscount.targetCategory, {
      $addToSet: { discount: updatedDiscount._id },
    });
  }

  //updating subcategory

  if (
    oldDiscount.discountPlan === "subcategory" &&
    oldDiscount.targetSubCategory?.toString() !==
      updatedDiscount.targetSubCategory?.toString()
  ) {
    //remove discount id from old subcategory
    await subCategoryModel.findByIdAndUpdate(oldDiscount.targetSubCategory, {
      discount: null,
    });

    //add discount id to new subcategory
    await subCategoryModel.findByIdAndUpdate(
      updatedDiscount.targetSubCategory,
      {
        $addToSet: { discount: updatedDiscount._id },
      }
    );
  }

  apiResponse.sendsuccess(res, 200, "discount updated", updatedDiscount);
});

//delete discount controller
exports.deleteDiscount = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(400, "slug is missing");

  const discount = await discountModel.findOne({ slug: slug });
  if (!discount) throw new customError(404, "discount not found");

  if (discount.discountPlan === "category") {
    await categoryModel.findByIdAndUpdate(discount.targetCategory, {
      discount: null,
    });

    if (discount.discountPlan === "subcategory") {
      await subCategoryModel.findByIdAndUpdate(discount.targetSubCategory, {
        discount: null,
      });
    }
  }

  //now delete the discount
  const removeDiscount = await discountModel.deleteOne({ _id: discount._id });
  apiResponse.sendsuccess(res, 200, "discount deleted", removeDiscount);
});
