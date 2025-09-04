const joi = require("joi");
const { customError } = require("../../utils/customError");

// Brand validation schema
const brandValidationSchema = joi.object(
  {
    name: joi.string().trim().required().messages({
      "string.empty": "Brand name is required.",
      "any.required": "Brand name field cannot be empty.",
    }),
    since: joi.number().integer().min(1800).max(new Date().getFullYear()).required().messages({
      "number.base": "Since must be a number (year).",
      "number.empty": "Since year is required.",
      "any.required": "Since field cannot be empty.",
      "number.min": "Since year seems too old.",
      "number.max": "Since year cannot be in the future.",
    }),
    icon: joi.string().default("accessibility"),
    color: joi.string().default("orange"),
    isActive: joi.boolean().default(true),
  },
  {
    allowUnknown: true,
  }
);

exports.validateBrand = async (req) => {
  try {
    const value = await brandValidationSchema.validateAsync(req.body);

    // Image validation
    const acceptType = ["image/jpg", "image/jpeg", "image/png", "image/webp"];
    if (!req?.files?.image || !acceptType.includes(req.files.image[0].mimetype)) {
      throw new customError(400, "This image format is not allowed.");
    }

    if (req.files.image[0].size > 5 * 1024 * 1024) {
      throw new customError(401, "Maximum image size is 5MB.");
    }

    if (req.files.image.length > 1) {
      throw new customError(401, "Maximum image length is 1.");
    }

    return { ...value, image: req.files.image[0] };
  } catch (error) {
    console.log("Error from brand validation", error);
    throw new customError(401, error.details ? error.details[0].message : error.message);
  }
};
