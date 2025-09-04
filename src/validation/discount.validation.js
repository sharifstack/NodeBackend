const joi = require("joi");
const { customError } = require("../../utils/customError");

// Helper regex for MongoDB ObjectId
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

// Discount validation schema
const discountValidationSchema = joi.object(
  {
    discountName: joi.string().trim().required().messages({
      "string.empty": "Discount name is required.",
      "any.required": "Discount name field cannot be empty.",
    }),
    discountType: joi.string().valid("Tk", "percentage").required().messages({
      "any.only": "Discount type must be either 'Tk' or 'percentage'.",
      "any.required": "Discount type is required.",
    }),
    discountTargetType: joi.string().valid("flat", "category", "product").required().messages({
      "any.only": "Discount target type must be 'flat', 'category', or 'product'.",
      "any.required": "Discount target type is required.",
    }),
    discountValueByAmount: joi.when("discountType", {
      is: "Tk",
      then: joi.number().min(0).required().messages({
        "number.base": "Discount amount must be a number.",
        "any.required": "Discount amount is required for 'Tk' type.",
      }),
      otherwise: joi.number().min(0).optional(),
    }),
    discountValueByPercentage: joi.when("discountType", {
      is: "percentage",
      then: joi.number().min(0).max(100).required().messages({
        "number.base": "Discount percentage must be a number.",
        "number.max": "Discount percentage cannot be more than 100.",
        "any.required": "Discount percentage is required for 'percentage' type.",
      }),
      otherwise: joi.number().optional(),
    }),
    targetProduct: joi.string().pattern(objectIdPattern).when("discountTargetType", {
      is: "product",
      then: joi.required().messages({ "any.required": "Target product is required for product discount." }),
      otherwise: joi.optional(),
    }),
    targetCategory: joi.string().pattern(objectIdPattern).when("discountTargetType", {
      is: "category",
      then: joi.required().messages({ "any.required": "Target category is required for category discount." }),
      otherwise: joi.optional(),
    }),
    targetSubCategory: joi.string().pattern(objectIdPattern).optional(),
    discountValidFrom: joi.boolean().optional(),
    discountValidTo: joi.boolean().optional(),
    icon: joi.string().default("disc"),
    color: joi.string().default("navy"),
    isActive: joi.boolean().default(true),
  },
  { allowUnknown: true }
);

exports.validateDiscount = async (req) => {
  try {
    const value = await discountValidationSchema.validateAsync(req.body);
    return value;
  } catch (error) {
    console.log("Error from discount validation", error);
    throw new customError(401, error.details ? error.details[0].message : error.message);
  }
};
