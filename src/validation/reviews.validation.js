const Joi = require("joi");
const mongoose = require("mongoose");
const { customError } = require("../../utils/customError");

// Helper: check valid ObjectId
const isValidObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

// Review Validation Schema
const reviewValidationSchema = Joi.object(
  {
    reviewer: Joi.string().required().custom(isValidObjectId).messages({
      "string.empty": "Reviewer ID is required.",
      "any.required": "Reviewer ID is required.",
      "any.invalid": "Reviewer ID must be a valid ObjectId.",
    }),
    comment: Joi.string().trim().required().messages({
      "string.empty": "Comment cannot be empty.",
      "any.required": "Comment is required.",
    }),
    rating: Joi.number().integer().min(1).max(5).required().messages({
      "number.base": "Rating must be a number.",
      "number.min": "Rating cannot be less than 1.",
      "number.max": "Rating cannot be more than 5.",
      "any.required": "Rating is required.",
    }),
    product: Joi.string().allow(null).custom(isValidObjectId).messages({
      "any.invalid": "Product ID must be a valid ObjectId.",
    }),
    variant: Joi.string().allow(null).custom(isValidObjectId).messages({
      "any.invalid": "Variant ID must be a valid ObjectId.",
    }),
  },
  {
    allowUnknown: true, // Allows extra fields if needed
  }
);

// Export validation function
exports.validateReview = async (req) => {
  try {
    const value = await reviewValidationSchema.validateAsync(req.body);
    return value;
  } catch (error) {
    console.log("Error from validateReview method:", error);
    throw new customError(
      401,
      error.details ? error.details[0].message : error.message
    );
  }
};
