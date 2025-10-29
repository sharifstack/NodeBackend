const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const { customError } = require("../../utils/customError");
const { validateCart } = require("../validation/cart.validation");
const productModel = require("../models/product.model");
const cartModel = require("../models/cart.model");

//full add to cart
exports.addToCart = asyncHandler(async (req, res) => {
  const { user, guestId, productId, variantId, quantity, coupon, color, size } =
    await validateCart(req);

  const filter = user ? { user } : { guestId };
  let addToCart = {};
  let product = {};
  let variant = {};
  let price = {};

  if (productId) {
    product = await productModel.findById(productId);
    price = product.retailPrice;
  }

  if (variantId) {
    variant = await productModel.findById(variantId);
    price = variant.retailPrice;
  }

  const existingCart = await cartModel.findOne(filter);

  if (!existingCart) {
    addToCart = new cartModel({
      user: user,
      guestId: guestId,
      items: [
        {
          product: productId || null,
          variant: variantId || null,
          price: productId ? price : price,
          quantity: quantity,
          totalPrice: productId
            ? Math.floor(price * quantity)
            : Math.floor(price * quantity),
          size,
          color,
        },
      ],
    });
  } else {
    const matchedCartItemIndex = existingCart.items.findIndex(
      (cartItem) =>
        cartItem.product == productId || cartItem.variant == variantId
    );
    console.log("Matched index:", matchedCartItemIndex);

    if (matchedCartItemIndex >= 0) {
      existingCart.items[matchedCartItemIndex].quantity += quantity || 1;
      existingCart.items[matchedCartItemIndex].totalPrice = Math.floor(
        existingCart.items[matchedCartItemIndex].price *
          existingCart.items[matchedCartItemIndex].quantity
      );
    } else {
      addToCart.items.push({
        product: productId || null,
        variant: variantId || null,
        price: productId ? price : price,
        quantity: quantity,
        totalPrice: productId
          ? Math.floor(price * quantity)
          : Math.floor(price * quantity),
        size,
        color,
      });
    }
  }

  //finalprice And total products
  const estimatedTotal = existingCart.items.reduce(
    (acc, item) => {
      acc.finalPrice = item.totalPrice;
      acc.totalProducts = item.quantity;
      return acc;
    },
    {
      totalProducts: 0,
      finalPrice: 0,
    }
  );
  console.log(estimatedTotal);

  existingCart.totalAmountOfWholeProduct = estimatedTotal.finalPrice;
  existingCart.totalProducts = estimatedTotal.totalProducts;

  await existingCart.save();
  apiResponse.sendsuccess(res, 200, "success", existingCart);
});
