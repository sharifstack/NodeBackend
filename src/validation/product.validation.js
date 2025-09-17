const joi = require("joi");
const { customError } = require("../../utils/customError");

// Product validation schema
const productValidationSchema = joi.object(
  {
    Name: joi.string().trim().required().messages({
      "string.empty": "Product name is required.",
      "any.required": "Product name field cannot be empty.",
    }),
    description: joi.string().allow("", null),
    category: joi.string().required().messages({
      "any.required": "Category is required.",
    }),
    subCategory: joi.string().allow("", null),
    brand: joi.string().allow("", null),
    variant: joi.string().allow("", null),
    discount: joi.string().allow("", null),
    tag: joi.array().items(joi.string().trim()).default([]),
    manufactureCountry: joi.string().allow("", null),
    rating: joi.number().min(0).max(5).default(0),
    warrantyInformation: joi.string().allow("", null),
    warrantyClaim: joi.boolean().default(true),
    warrantyexpires: joi.date().allow(null),
    availabilityStatus: joi
      .string()
      .valid("In Stock", "Out Of Stock", "Pre-Order")
      .default("In Stock"),
    shippingInformation: joi.string().allow("", null),
    sku: joi.string().required().messages({
      "string.empty": "SKU is required.",
      "any.required": "SKU field cannot be empty.",
    }),
    qrCode: joi.string().allow("", null),
    barCode: joi.string().allow("", null),
    groupUnit: joi.string().valid("Box", "Packet", "Dozen", "Custom"),
    groupUnitQuantity: joi.number().min(1).default(1).allow(null).optional(),
    unit: joi.string().valid("Piece", "Kg", "Gram", "Custom"),
    varientType: joi
      .string()
      .valid("singleVarient", "multipleVarient")
      .required()
      .default("singleVarient"),
    size: joi
      .string()
      .valid("S", "M", "L", "XL", "XXL", "XXXL", "Custom", "N/A")
      .default("N/A"),
    color: joi.string().allow("", null),
    stock: joi.number().min(0).default(0),
    warehouseLocation: joi.string().allow("", null),
    retailPrice: joi.number().min(0).required().messages({
      "number.base": "Retail price must be a number.",
      "any.required": "Retail price is required.",
    }),
    retailPriceProfitAmount: joi.number().min(0).default(0),
    retailPriceProfitAmountPercentance: joi
      .number()
      .min(0)
      .max(100)
      .default(0),
    wholesalePrice: joi.number().min(0).required().messages({
      "number.base": "Wholesale price must be a number.",
      "any.required": "Wholesale price is required.",
    }),
    alertQuantity: joi.number().min(0).default(0),
    stockQuantity: joi.number().min(0).default(0),
    instock: joi.boolean().default(true),
    isActive: joi.boolean().default(true),
    minimumQuantity: joi.number().min(1).default(1),
  },
  {
    allowUnknown: true,
  }
);

// Product validator function
exports.validateProduct = async (req) => {
  try {
    const value = await productValidationSchema.validateAsync(req.body);

    // Image validation
    const acceptType = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

    if (!req?.files?.image || req.files.image.length === 0) {
      throw new customError(400, "Product image is required.");
    }

    for (const file of req.files.image) {
      if (!acceptType.includes(file.mimetype)) {
        throw new customError(400, "This image format is not allowed.");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new customError(401, "Maximum image size is 5MB.");
      }
    }

    return { ...value, image: req.files.image };
  } catch (error) {
    console.log("Error from product validation", error);
    throw new customError(
      401,
      error.details ? error.details[0].message : error.message
    );
  }
};
