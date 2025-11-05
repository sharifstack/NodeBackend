require("dotenv").config();
const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const { customError } = require("../../utils/customError");
const { validateOrder } = require("../validation/order.validation");
const orderModel = require("../models/order.model");
const cartModel = require("../models/cart.model");
const productModel = require("../models/product.model");
const variantModel = require("../models/variant.model");
const deliveryModel = require("../models/delivery.model");
const invoiceModel = require("../models/invoice.model");
const { getTransactionId } = require("../helpers/transactionId");
const SSLCommerzPayment = require("sslcommerz-lts");
const { getAllProductsName } = require("../helpers/getAllProductsName");
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = process.env.NODE_ENV === "development" ? false : true;

//apply delivery charge function
const applyDeliveryCharge = async (deliveryCharge) => {
  try {
    return await deliveryModel.findById(deliveryCharge);
  } catch (error) {
    throw new customError(500, "Delivery charge application failed", error);
  }
};

//create order controller
exports.createOrder = asyncHandler(async (req, res) => {
  const { user, guestId, shippinginfo, deliveryCharge, paymentMethod } =
    await validateOrder(req);
  const userIndentify = user ? { user } : { guestId };

  const cart = await cartModel.findOne(userIndentify);
  if (!cart) throw new customError(404, "Cart not found");

  const productandVariantsinfo = await Promise.all(
    cart.items.map(async (item) => {
      const updateItemsFields = {
        $inc: { stock: -item.quantity, totalSale: item.quantity },
      };

      if (item.product) {
        return productModel.findOneAndUpdate(
          { _id: item.product },
          updateItemsFields,
          { new: true }
        );
      } else {
        return variantModel.findOneAndUpdate(
          { _id: item.variant },
          updateItemsFields,
          { new: true }
        );
      }
    })
  );

  const order = new orderModel({
    user,
    guestId,
    items: productandVariantsinfo,
    shippinginfo,
    coupon: cart.coupon,
    deliveryCharge,
    discountAmount: cart.discountAmount,
  });

  const charge = await applyDeliveryCharge(deliveryCharge);
  order.finalAmount =
    Math.ceil(cart.totalAmountOfWholeProduct + charge.amount) -
    cart.discountAmount;
  order.deliveryZone = charge.name;

  //Transaction ID
  const transactionId = getTransactionId();
  order.transactionId = transactionId;
  const allProductNames = getAllProductsName(order.items);

  //makeing invoice id
  const invoice = await invoiceModel.create({
    invoiceId: order.transactionId,
    order: order._id,
  });
  //Payement Method
  if (paymentMethod === "cod") {
    order.paymentMethod = "cod";
    order.paymentStatus = "Pending";
    order.invoiceId = invoice.invoiceId;
  } else {
    const data = {
      total_amount: order.finalAmount,
      currency: "BDT",
      tran_id: transactionId, // use unique tran_id for each api call
      success_url: "http://localhost:3000/api/v1/payment/payment-success",
      fail_url: "http://localhost:3000/api/v1/payment/payment-fail",
      cancel_url: "http://localhost:3000/api/v1/payment/payment-cancel",
      ipn_url: "http://localhost:3000/api/v1/payment/payment-ipn",
      shipping_method: "Courier",
      product_name: allProductNames,
      product_category: "Electronic",
      product_profile: "general",
      cus_name: shippinginfo.firstName,
      cus_email: shippinginfo.email,
      cus_add1: shippinginfo.address,
      cus_add2: "Dhaka",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: shippinginfo.phone,
      cus_fax: "01711111111",
      ship_name: shippinginfo.firstName,
      ship_add1: "Dhaka",
      ship_add2: "Dhaka",
      ship_city: "Dhaka",
      ship_state: "Dhaka",
      ship_postcode: 1000,
      ship_country: "Bangladesh",
    };
    try {
      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      const response = await sslcz.init(data);
      order.orderStatus = "Pending";
      order.paymentMethod = "online";
      order.totalQuantity = cart.totalProducts;
      order.invoiceId = invoice.invoiceId;
      await order.save();

      //remove cart after order is placed
      await cartModel.findByIdAndDelete({ _id: cart._id });
      apiResponse.sendsuccess(
        res,
        200,
        "SSLCommerz Payment Gateway Initiated",
        {
          url: response.GatewayPageURL,
        }
      );
    } catch (error) {
      await Promise.all(
        cart.items.map(async (item) => {
          const updateItemsFields = {
            $inc: { stock: item.quantity, totalSale: -item.quantity },
          };

          if (item.product) {
            return productModel.findOneAndUpdate(
              { _id: item.product },
              updateItemsFields,
              { new: true }
            );
          } else {
            return variantModel.findOneAndUpdate(
              { _id: item.variant },
              updateItemsFields,
              { new: true }
            );
          }
        })
      );

      await invoiceModel.findOneAndDelete({ invoiceId: order.invoiceId });
      throw new customError(
        500,
        `SSLCommerz Payment Gateway Initialization Failed ${error}`
      );
    }
  }
});
