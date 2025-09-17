const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const { customError } = require("../../utils/customError");
const {
  uploadCloudinaryFIle,
  deleteCloudinaryFile,
} = require("../helpers/cloudinary");
const { validateProduct } = require("../validation/product.validation");
const productModel = require("../models/product.model");
const { generateQR } = require("../helpers/qrCodeGenerator");
const { barCodeGenerator } = require("../helpers/barCodeGenerator");

//crating product
exports.createProduct = asyncHandler(async (req, res) => {
  const productData = await validateProduct(req);

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
