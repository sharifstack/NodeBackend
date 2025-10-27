const joi = require("joi");
const { customError } = require("../../utils/customError");

const cartValidationSchema = joi.object({
  user: joi.string().hex().length(24).allow(null, "").optional().messages({
    "string.hex": "User ID must be a valid hex string.",
    "string.length": "User ID must be 24 characters long.",
  }),
  guestId: joi.string().allow(null).optional().messages({
    "string.base": "Guest ID must be a string.",
  }),
  productId: joi.string().hex().length(24).allow(null).optional().messages({
    "any.required": "Product ID is required.",
    "string.hex": "Product ID must be a valid hex string.",
    "string.length": "Product ID must be 24 characters long.",
  }),
  variantId: joi.string().hex().length(24).optional().allow(null).messages({
    "string.hex": "Variant ID must be a valid hex string.",
    "string.length": "Variant ID must be 24 characters long.",
  }),
  quantity: joi.number().integer().min(1).required().messages({
    "number.base": "Quantity must be a number.",
    "number.min": "Quantity must be at least 1.",
    "any.required": "Quantity is required.",
  }),
  coupon: joi
    .string()
    .alphanum()
    .min(3)
    .max(20)
    .optional()
    .allow(null)
    .messages({
      "string.base": "Coupon must be a string.",
      "string.alphanum": "Coupon code must contain only letters and numbers.",
      "string.min": "Coupon code must be at least 3 characters long.",
      "string.max": "Coupon code cannot exceed 20 characters.",
    }),

  color: joi.string().optional().messages({
    "string.base": "Color must be a string.",
  }),
  size: joi.string().optional().messages({
    "string.base": "Size must be a string.",
  }),
});

exports.validateCart = async (req) => {
  try {
    const value = await cartValidationSchema.validateAsync(req.body, {
      abortEarly: false,
    });
    return value;
  } catch (error) {
    throw new customError(
      400,
      error.details
        ? error.details.map((d) => d.message).join(", ")
        : error.message
    );
  }
};
