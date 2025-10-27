const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const { customError } = require("../../utils/customError");
const { validateCart } = require("../validation/cart.validation");
const productModel = require("../models/product.model");

//full add to cart
exports.addToCart = asyncHandler(async (req, res) => {
  const { user, guestId, productId, variantId, quantity, coupon, color, size } =
    await validateCart(req);

  let addToCart = {};
  let product = {};
  let variant = {};
  let price = {};

  if (productId) {
    product = await productModel.findById(productId);
  }

  
  if (variantId) {
    variant = await productModel.findById(variantId);
  }
});
