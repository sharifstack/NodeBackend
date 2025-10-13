const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const { customError } = require("../../utils/customError");
const {
  uploadCloudinaryFIle,
  deleteCloudinaryFile,
  PublicId,
} = require("../helpers/cloudinary");
const { validateProduct } = require("../validation/product.validation");
const productModel = require("../models/product.model");
const { generateQR } = require("../helpers/qrCodeGenerator");
const { barCodeGenerator } = require("../helpers/barCodeGenerator");

//crating product
exports.createProduct = asyncHandler(async (req, res) => {
  const productData = await validateProduct(req);
  if (!productData)
    throw new customError(500, "Product Information is missing");

  //destructuring image form productData
  const { image } = productData;

  //upload allimages into cloudinary
  let allImages = [];
  for (let imgFile of image) {
    const imageinfo = await uploadCloudinaryFIle(imgFile.path);
    allImages.push(imageinfo);
  }

  //saving created product into database
  const product = await productModel.create({
    ...productData,
    image: allImages,
  });

  if (!product) throw new customError(500, "product creation failed.");

  //Generate Qrcode
  qrCodeLink = `https://www.mobiledokan.com/mobile/apple-iphone-17-pro-max`;
  const qrCode = await generateQR(qrCodeLink);

  //Generate BarCode
  const barCode = await barCodeGenerator(product.sku);

  //saving QR code and Bar code into database
  product.qrCode = qrCode;
  product.barCode = barCode;
  await product.save();

  apiResponse.sendsuccess(
    res,
    201,
    "Product has been created sucessfully",
    product
  );
});

//get all product
exports.getAllProduct = asyncHandler(async (req, res) => {
  getAllProducts = await productModel
    .find({})
    .populate("category subCategory brand")
    .sort({ CreatedAt: -1 });

  if (!getAllProducts?.length) throw new customError(401, "Product Not Found");

  apiResponse.sendsuccess(
    res,
    201,
    "product retrive sucessfully",
    getAllProducts
  );
});

//single product
exports.singleProduct = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(500, "Slug is Missing");

  const product = await productModel
    .findOne({ slug: slug })
    .populate("category subCategory brand")
    .sort({ CreatedAt: -1 });
  if (!product) throw new customError(401, "Product Not Found");

  apiResponse.sendsuccess(res, 200, "Product Has Been Found", product);
});

//Update Products info

exports.updateProduct = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(401, "slug is missing");

  const productupdate = await productModel.findOneAndUpdate(
    { slug: slug },
    { ...req.body },
    { new: true }
  );

  if (!productupdate) throw new customError(500, "product not found");

  apiResponse.sendsuccess(
    res,
    200,
    "product has been updated sucessfully",
    productupdate
  );
});

//upload product images

exports.uploadProductImage = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  if (!slug) throw new customError(401, "slug is missing");

  const product = await productModel.findOne({ slug: slug });
  if (!product) throw new customError(401, "Product Not Found");

  //uploading to cloudinary
  for (let img of req?.files?.image) {
    const imgURl = await uploadCloudinaryFIle(img.path);
    product.image.push(imgURl);
  }

  await product.save();
  apiResponse.sendsuccess(
    res,
    201,
    "Image has been uploaded sucessfully",
    product
  );
});

//delete existing product image from cloudinary

exports.removeProductImage = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(401, "slug is missing");

  const { image_Id } = req.body;
  if (!image_Id || !image_Id.length)
    throw new customError(401, "Image ID is Missing");

  const product = await productModel.findOne({ slug: slug });
  if (!product) throw new customError(401, "product not found");

  const updatedImageList = await product.image.filter(
    (img) => img !== image_Id
  );
  const Public_Id = PublicId(image_Id);
  await deleteCloudinaryFile(Public_Id);

  product.image = updatedImageList;
  await product.save();

  apiResponse.sendsuccess(res, 201, "Product Image has been removed", product);
});

//delete product and remove image from cloudinary

exports.deleteProduct = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(401, "slug is missing");

  const product = await productModel.findOne({ slug: slug });
  if (!product) throw new customError(401, "product not found");

  for (let img of product.image) {
    const public_id = PublicId(img);
    const result = await deleteCloudinaryFile(public_id);
    console.log("deleted", result);
  }

  const deleteProduct = await productModel.deleteOne({ _id: product._id });
  if (!deleteProduct)
    throw new customError(401, "Failed to delete the product");

  apiResponse.sendsuccess(
    res,
    200,
    "Product has been deleted sucessfully",
    product
  );
});

//search by products using query

exports.searchByProducts = asyncHandler(async (req, res) => {
  const { category, subcategory, brand, tag } = req.query;

  let query = {};

  if (category) {
    query.category = category;
  }

  if (subcategory) {
    query.subcategory = subcategory;
  }

  if (brand) {
    if (Array.isArray(brand)) {
      query.brand = { $in: brand };
    } else {
      query.brand = brand;
    }
  }

  if (tag) {
    if (Array.isArray(tag)) {
      query.tag = { $in: tag };
    } else {
      query.tag = tag;
    }
  }

  const product = await productModel.find(query);
  if (product.length == 0) throw new customError(401, "product not found");

  apiResponse.sendsuccess(res, 200, "Product fetched successfully", product);
});

//All product list // pagination

exports.pagination = asyncHandler(async (req, res) => {
  const { item, page } = req.query;

  const itemNum = parseInt(item, 20);
  const pageNum = parseInt(page, 20);
  if (!itemNum || !pageNum)
    throw new customError(401, "item or page not found");
  const skipItems = (pageNum - 1) * itemNum;
  const totalItems = await productModel.countDocuments();
  const totalPages = Math.round(totalItems / item);
  const product = await productModel.find().skip(skipItems).limit(itemNum);

  if (product.length == 0) throw new customError(401, "product not found");

  apiResponse.sendsuccess(res, 200, "Product fetched successfully", {
    ...product,
    totalPages,
    totalItems,
  });
});

//price range from  query

exports.priceRange = asyncHandler(async (req, res) => {
  const { maxPrice, minPrice } = req.query;
  if (!minPrice && !maxPrice)
    throw new custom(400, "Minimun or Maximun Price is Missing");

  let query;
  if (minPrice && maxPrice) {
    query = { $gte: minPrice, $lte: maxPrice };
  } else if (minPrice) {
    query = { $gte: minPrice };
  } else if (maxPrice) {
    query = { $lte: maxPrice };
  } else {
    query = {};
  }

  const product = await productModel.find({ retailPrice: query });
  if (product.length == 0) throw new customError(400, "product not found");

  apiResponse.sendsuccess(
    res,
    200,
    "Products has been found In This Price Range",
    product
  );
});

//product items ordering

exports.productOdering = asyncHandler(async (req, res) => {
  const { sort_by } = req.query;
  if (!sort_by) throw new customError(400, "Query is missing ");

  let query = {};
  if (sort_by == "date-ascending") {
    query = { createdAt: 1 };
  } else if (sort_by == "date-descending") {
    query = { createdAt: -1 };
  } else if (sort_by == "price-ascending") {
    query = { retailPrice: 1 };
  } else if (sort_by == "price-descending") {
    query = { retailPrice: -1 };
  } else if (sort_by == "name-ascending") {
    query = { Name: 1 };
  } else if (sort_by == "name-descending") {
    query = { Name: -1 };
  } else {
    query = {};
  }

  const product = await productModel.find({}).sort(query);
  if (product.length == 0) throw new customError(400, "product not fount");
  apiResponse.sendsuccess(res, 200, "Products  has been found", product);
});

//product activity status change
exports.productStatus = asyncHandler(async (req, res) => {
  const { slug, status } = req.query;
  if (!slug) throw new customError(400, "slug is missing");

  const product = await productModel.findOne({ slug });
  if (!product) throw new customError(401, "product not found");

  product.isActive = status == "active" ? true : false;

  await product.save();

  apiResponse.sendsuccess(
    res,
    200,
    "product status updated successfully",
    product
  );
});
