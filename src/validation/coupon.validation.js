const Joi = require("joi");
const mongoose = require("mongoose");
const { customError } = require("../../utils/customError");

// Helper: check valid ObjectId (not used here yet, but ready for extension)
const isValidObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

// Coupon Validation Schema
const couponValidationSchema = Joi.object(
  {
    couponCode: Joi.string().trim().required().messages({
      "string.empty": "Coupon code cannot be empty.",
      "any.required": "Coupon code is required.",
    }),

    expireAt: Joi.date().greater("now").required().messages({
      "date.base": "Expire date must be a valid date.",
      "date.greater": "Expire date must be in the future.",
      "any.required": "Expire date is required.",
    }),

    usageLimit: Joi.number().integer().min(1).default(60).messages({
      "number.base": "Usage limit must be a number.",
      "number.min": "Usage limit must be at least 1.",
      "number.integer": "Usage limit must be an integer.",
    }),

    usedCount: Joi.number().integer().min(0).default(0).messages({
      "number.base": "Used count must be a number.",
      "number.min": "Used count cannot be negative.",
      "number.integer": "Used count must be an integer.",
    }),

    discountType: Joi.string().valid("percentage", "tk").required().messages({
      "any.only": "Discount type must be either 'percentage' or 'tk'.",
      "any.required": "Discount type is required.",
    }),

    discountValue: Joi.number().min(0).required().messages({
      "number.base": "Discount value must be a number.",
      "number.min": "Discount value cannot be negative.",
      "any.required": "Discount value is required.",
    }),

    isActive: Joi.boolean().default(true),
  },
  {
    allowUnknown: true,
  }
);

// Export validation function
exports.validateCoupon = async (req) => {
  try {
    const value = await couponValidationSchema.validateAsync(req.body);
    return value;
  } catch (error) {
    console.log("Error from validate Coupon method:", error);
    throw new customError(
      401,
      error.details ? error.details[0].message : error.message
    );
  }
};
