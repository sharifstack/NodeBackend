const joi = require("joi");
const { customError } = require("../../utils/customError");

// Warranty validation schema
const warrantyValidationSchema = joi.object({
  startDate: joi.date().required().messages({
    "date.base": "Start date must be a valid date.",
    "any.required": "Start date is required.",
  }),

  endDate: joi.date().greater(joi.ref("startDate")).required().messages({
    "date.base": "End date must be a valid date.",
    "date.greater": "End date must be later than start date.",
    "any.required": "End date is required.",
  }),

  policy: joi.string().trim().required().messages({
    "string.empty": "Warranty policy is required.",
    "any.required": "Warranty policy field cannot be empty.",
  }),

  isActive: joi.boolean().default(true),

  product: joi.string().required().messages({
    "string.empty": "Product ID is required.",
    "any.required": "Product reference is required.",
  }),
});

// Warranty validator function
exports.validateWarranty = async (req) => {
  try {
    const value = await warrantyValidationSchema.validateAsync(req.body);
    return value;
  } catch (error) {
    console.log("Error from warranty validation", error);
    throw new customError(
      401,
      error.details ? error.details[0].message : error.message
    );
  }
};
