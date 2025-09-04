const joi = require("joi");
const { customError } = require("../../utils/customError");

// SubCategory validation schema
const subCategoryValidationSchema = joi.object(
  {
    name: joi.string().trim().required().messages({
      "string.empty": "SubCategory name is required.",
      "any.required": "SubCategory name field cannot be empty.",
    }),
    category: joi.string().trim().required().messages({
      "string.empty": "Category ID is required.",
      "any.required": "Category field cannot be empty.",
    }),
    isActive: joi.boolean().default(true),
  },
  {
    allowUnknown: true,
  }
);

exports.validateSubCategory = async (req) => {
  try {
    const value = await subCategoryValidationSchema.validateAsync(req.body);
    return value;
  } catch (error) {
    console.log("Error from subCategory validation", error);
    throw new customError(401, error.details[0].message);
  }
};
