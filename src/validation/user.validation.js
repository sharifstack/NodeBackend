const joi = require("joi");
const { customError } = require("../../utils/customError");

const userValidationSchema = joi
  .object({
    email: joi
      .string()
      .trim()
      .pattern(/^([\w.*-]+@([\w-]+\.)+[\w-]{2,4})?$/)
      .messages({
        "string.empty": "Email is required.",
        "string.pattern.base": "Please enter a valid email address.",
        "any.required": "Email field cannot be empty.",
      }),

    password: joi
      .string()
      .trim()
      .required()
      .pattern(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/
      )
      .messages({
        "string.empty": "Password is required.",
        "string.pattern.base":
          "Password must be at least 8 characters long and include one uppercase letter, one number, and one special character.",
        "any.required": "Password field cannot be empty.",
      }),

    phoneNumber: joi
      .string()
      .empty()
      .trim()
      .pattern(/^(?:\+8801[3-9]\d{8}|01[3-9]\d{8})$/)
      .messages({
        "string.empty": "Phone number is required",
        "string.pattern.base":
          "Phone number must be a valid Bangladeshi number (e.g. 01XXXXXXXXX or +8801XXXXXXXXX)",
        "string.base": "Phone number must be a string",
      }),
  })
  .unknown(true);

exports.validateUser = async (req, res, next) => {
  try {
    const value = await userValidationSchema.validateAsync(req.body);
    return value;
  } catch (error) {
    console.log("Error from user validation", error);
    throw new customError(401, error.details[0].message);
  }
};
