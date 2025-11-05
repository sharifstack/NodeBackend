const Joi = require("joi");
const { customError } = require("../../utils/customError");

// DeliveryCharge Validation Schema
const deliveryValidationSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.base": "Name must be a string.",
    "string.empty": "Name cannot be empty.",
    "any.required": "Name is required.",
  }),

  amount: Joi.number().min(0).required().messages({
    "number.base": "Amount must be a number.",
    "number.min": "Amount cannot be negative.",
    "any.required": "Amount is required.",
  }),

  isActive: Joi.boolean().optional().messages({
    "boolean.base": "isActive must be a boolean value (true or false).",
  }),
});

// Exported validation function
exports.validateDelivery = async (req) => {
  try {
    const value = await deliveryValidationSchema.validateAsync(req.body, {
      abortEarly: true,
      stripUnknown: true,
    });
    return value;
  } catch (error) {
    console.log("Error from validateDelivery:", error);
    throw new customError(
      400,
      error.details ? error.details[0].message : error.message
    );
  }
};
