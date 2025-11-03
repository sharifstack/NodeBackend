const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const { customError } = require("../../utils/customError");
const { validateCart } = require("../validation/cart.validation");
const productModel = require("../models/product.model");
const cartModel = require("../models/cart.model");
const couponModel = require("../models/coupon.model");
const { getIO } = require("../socket-io/server");

//create add to cart
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

  addToCart = await cartModel.findOne(filter);

  if (!addToCart) {
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
    const matchedCartItemIndex = addToCart.items.findIndex(
      (cartItem) =>
        cartItem.product.toString() === productId.toString() ||
        cartItem.product.toString() === productId.toString()
    );

    if (matchedCartItemIndex >= 0) {
      addToCart.items[matchedCartItemIndex].quantity += quantity || 1;
      addToCart.items[matchedCartItemIndex].totalPrice = Math.floor(
        addToCart.items[matchedCartItemIndex].price *
          addToCart.items[matchedCartItemIndex].quantity
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
  const estimatedTotal = addToCart.items.reduce(
    (acc, item) => {
      acc.finalPrice += item.totalPrice;
      acc.totalProducts += item.quantity;
      return acc;
    },
    {
      totalProducts: 0,
      finalPrice: 0,
    }
  );

  addToCart.totalAmountOfWholeProduct = estimatedTotal.finalPrice;
  addToCart.totalProducts = estimatedTotal.totalProducts;

  await addToCart.save();

  //socket.io
  getIO().to("222").emit("addToCart", {
    messsage: "item added to the cart",
    data: null,
  });
  //socket.io
  apiResponse.sendsuccess(res, 200, "cart added Succesfully", addToCart);
});

//applyCoupon function

const applyCoupon = async (actualPrice, coupon) => {
  let priceAfterDiscount = 0;
  let totalDiscountAmount = 0;
  try {
    const appliedCoupon = await couponModel.findOne({ couponCode: coupon });
    const { expireAt, usageLimit, usedCount, discountType, discountValue } =
      appliedCoupon;

    if (usageLimit < usedCount)
      throw new customError(404, "coupon has been expired");

    if (discountType == "percentage") {
      totalDiscountAmount = Math.ceil((actualPrice * discountValue) / 100);
      priceAfterDiscount = Math.ceil(actualPrice - totalDiscountAmount);
    } else {
      //when discountType is "Tk"
      priceAfterDiscount = actualPrice - discountValue;
    }

    appliedCoupon.usedCount += 1;
    await appliedCoupon.save();
    return {
      priceAfterDiscount,
      totalDiscountAmount,
      appliedCoupon,
    };
  } catch (error) {
    if (applyCoupon) {
      await couponModel.findOneAndUpdate(
        { couponCode: coupon },
        { usedCount: usedCount - 1 }
      );
    }
  }
  console.log("eror from apply coupon", error);
};

//apply coupon controller

exports.applyCoupon = asyncHandler(async (req, res) => {
  const { coupon, user, guestId } = req.body;

  const filter = user ? { user } : { guestId };

  const cart = await cartModel.findOne(filter);
  const { priceAfterDiscount, totalDiscountAmount, appliedCoupon } =
    await applyCoupon(cart.totalAmountOfWholeProduct, coupon);

  console.log({
    before: cart.totalAmountOfWholeProduct,
    after: priceAfterDiscount,
    discount: totalDiscountAmount,
    coupon: appliedCoupon.couponCode,
  });

  cart.coupon = appliedCoupon._id;
  cart.discountAmount = totalDiscountAmount;
  cart.discountType = appliedCoupon.discountType;
  cart.totalAmountOfWholeProduct = priceAfterDiscount;
  await cart.save();
  apiResponse.sendsuccess(res, 200, "Coupon Applied Successfully", cart);
});

//quantity increments
exports.incrementQuantity = asyncHandler(async (req, res) => {
  const { itemId } = req.body;

  const cart = await cartModel.findOne({ "items._id": itemId });

  const findItem = cart.items.findIndex((item) => (item._id = itemId));

  const selectedItem = cart.items[findItem];
  selectedItem.quantity += 1;
  selectedItem.totalPrice = Math.ceil(
    selectedItem.quantity * selectedItem.price
  );

  const estimatedTotal = cart.items.reduce(
    (acc, item) => {
      acc.finalPrice += item.totalPrice;
      acc.totalProducts += item.quantity;
      return acc;
    },
    {
      totalProducts: 0,
      finalPrice: 0,
    }
  );

  cart.totalAmountOfWholeProduct = estimatedTotal.finalPrice;
  cart.totalProducts = estimatedTotal.totalProducts;

  await cart.save();
  apiResponse.sendsuccess(
    res,
    200,
    "cart quantity increased successfully.",
    cart
  );
});

//quantity decrement
exports.decrementQuantity = asyncHandler(async (req, res) => {
  const { itemId } = req.body;

  const cart = await cartModel.findOne({ "items._id": itemId });

  const findItem = cart.items.findIndex((item) => (item._id = itemId));

  const selectedItem = cart.items[findItem];

  if (selectedItem.quantity > 1) {
    selectedItem.quantity -= 1;
    selectedItem.totalPrice = Math.ceil(
      selectedItem.quantity * selectedItem.price
    );
  } else {
    selectedItem.quantity = selectedItem.quantity;
    selectedItem.totalPrice = Math.ceil(
      selectedItem.quantity * selectedItem.price
    );
  }

  const estimatedTotal = cart.items.reduce(
    (acc, item) => {
      acc.finalPrice += item.totalPrice;
      acc.totalProducts += item.quantity;
      return acc;
    },
    {
      totalProducts: 0,
      finalPrice: 0,
    }
  );

  cart.totalAmountOfWholeProduct = estimatedTotal.finalPrice;
  cart.totalProducts = estimatedTotal.totalProducts;

  await cart.save();
  apiResponse.sendsuccess(
    res,
    200,
    "cart quantity decresed successfully.",
    cart
  );
});

//remove cart items
exports.removeCartItems = asyncHandler(async (req, res) => {
  const { itemId } = req.body;

  const cart = await cartModel.findOne({ "items._id": itemId });

  const remainingItems = cart.items.filter((item) => item._id != itemId);
  cart.items = remainingItems;

  const estimatedTotal = cart.items.reduce(
    (acc, item) => {
      acc.finalPrice += item.totalPrice;
      acc.totalProducts += item.quantity;
      return acc;
    },
    {
      totalProducts: 0,
      finalPrice: 0,
    }
  );

  cart.totalAmountOfWholeProduct = estimatedTotal.finalPrice;
  cart.totalProducts = estimatedTotal.totalProducts;

  await cart.save();
  if (cart.items.length == 0) [await cartModel.deleteOne({ _id: cart._id })];
  apiResponse.sendsuccess(res, 200, "cart has been remove successfully.", cart);
});
