const joi = require("joi");
const { customError } = require("../../utils/customError");

// Category validation schema
const categoryValidationSchema = joi.object(
  {
    name: joi.string().trim().required().messages({
      "string.empty": "Category name is required.",
      "any.required": "Category name field cannot be empty.",
    }),
  },
  {
    allowUnknown: true,
  }
);

exports.validateCategory = async (req) => {
  try {
    const value = await categoryValidationSchema.validateAsync(req.body);
    //mimeType
    const acceptType = ["image/jpg", "image/jpeg", "image/png", "image/webp"];
    if (!acceptType.includes(req?.files?.image[0].mimetype)) {
      throw new customError(400, "this image format is not allowed");
    }

    if (req.files?.image[0].size > 5 * 1024 * 1024) {
      throw new customError(401, "Maximum image Size 5MB ");
    }
    if (req.files.image?.length > 1) {
      throw new customError(401, "Maximum image Length is 1");
    }
    return { name: value.name, image: req?.files?.image[0] };
  } catch (error) {
    ``;
    console.log("Error from category validation", error);
    throw new customError(401, error.details[0].message);
  }
};
