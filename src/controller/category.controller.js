const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const { customError } = require("../../utils/customError");
const categoryModel = require("../models/category.model");
const { validateCategory } = require("../validation/category.validation");
const {
  uploadCloudinaryFIle,
  deleteCloudinaryFile,
} = require("../helpers/cloudinary");

exports.createCategory = asyncHandler(async (req, res) => {
  const value = await validateCategory(req);
  const category = await new categoryModel({
    name: value.name,
    image: null,
  }).save();
  if (!category) throw new customError(500, "Category creation failed");
  apiResponse.sendsuccess(res, 201, "Category Created", category);

  (async () => {
    try {
      const imageUrl = await uploadCloudinaryFIle(value?.image?.path);
      const updateCategoryImg = await categoryModel.findByIdAndUpdate(
        {
          _id: category._id,
        },
        { image: imageUrl },
      );
      console.log("Category Image Successfully Added", updateCategoryImg);
    } catch (error) {
      console.log("Category Image Failed to Add", error);
    }
  })();
});

exports.getAllCategory = asyncHandler(async (req, res) => {
  const category = await categoryModel
    .find()
    .populate("subCategory discount")
    .sort({ createdAt: -1 });
  if (!category) throw new customError(500, "category not found");
  apiResponse.sendsuccess(res, 200, "category found", category);
});

exports.sinlgeCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(400, "slug is missing");
  const category = await categoryModel.findOne({ slug: slug });
  if (!category) throw new customError(500, "category not found");
  apiResponse.sendsuccess(res, 200, "category found", category);
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(400, "slug is missing");
  const category = await categoryModel.findOne({ slug: slug });
  if (!category) throw new customError(500, "category not found");
  if (req.body.name) {
    category.name = req?.body?.name;
  }
  if (req.files.image) {
    const parts = category.image.split("/");
    const imageName = parts[parts.length - 1];
    const result = await deleteCloudinaryFile(imageName.split("?")[0]);
    if (result !== "ok") throw new customError(400, "image not deleted");
    const imageUrl = await uploadCloudinaryFIle(req?.files?.image[0]?.path);
    category.image = imageUrl;
  }
  await category.save();

  apiResponse.sendsuccess(res, 200, "category has been updated", category);
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(400, "slug is missing");
  const category = await categoryModel.findOne({ slug: slug });
  if (!category) throw new customError(500, "category not found");

  const parts = category.image.split("/");
  const imageName = parts[parts.length - 1];
  const result = await deleteCloudinaryFile(imageName.split("?")[0]);
  if (result !== "ok") throw new customError(400, "image not deleted");

  //database
  const removecategory = await categoryModel.findOneAndDelete({ slug: slug });

  apiResponse.sendsuccess(
    res,
    200,
    "category deleted succesfully",
    removecategory,
  );
});
