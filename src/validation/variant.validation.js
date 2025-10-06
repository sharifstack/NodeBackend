const joi = require("joi");
const { customError } = require("../../utils/customError");

// Variant validation schema
const variantValidationSchema = joi.object(
  {
    product: joi.string().required().messages({
      "any.required": "Product reference is required.",
    }),

    variantName: joi.string().trim().required().messages({
      "string.empty": "Variant name is required.",
      "any.required": "Variant name field cannot be empty.",
    }),

    variantDescription: joi.string().allow("", null),

    size: joi.string().default("N/A"),

    color: joi.string(),

    stockVariant: joi.number().min(0).default(0),

    alertVariantStock: joi.number().min(0).default(5),

    retailPrice: joi.number().min(0).required().messages({
      "number.base": "Retail price must be a number.",
      "any.required": "Retail price is required.",
    }),

    wholesalePrice: joi.number().min(0).required().messages({
      "number.base": "Wholesale price must be a number.",
      "any.required": "Wholesale price is required.",
    }),

    isActive: joi.boolean().default(true),
  },
  {
    allowUnknown: true,
  }
);

// Variant validator function
exports.validateVariant = async (req) => {
  try {
    // ✅ Validate body fields
    const value = await variantValidationSchema.validateAsync(req.body);

    // ✅ Image validation
    const acceptType = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

    if (!req?.files?.image || req.files.image.length === 0) {
      throw new customError(400, "At least one variant image is required.");
    }

    // Multiple image validation
    for (const file of req.files.image) {
      if (!acceptType.includes(file.mimetype)) {
        throw new customError(
          400,
          `${file.originalname} — invalid format. Only JPG, JPEG, PNG, WEBP allowed.`
        );
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new customError(
          401,
          `${file.originalname} exceeds 5MB size limit.`
        );
      }
    }

    return { ...value, image: req.files.image };
  } catch (error) {
    console.log("Error from variant validation:", error);
    throw new customError(
      401,
      error.details ? error.details[0].message : error.message
    );
  }
};
