const { asyncHandler } = require("../../utils/asyncHandler");
const { apiResponse } = require("../../utils/apiResponse");
const { customError } = require("../../utils/customError");
const orderModel = require("../models/order.model");
const { api } = require("../helpers/axios");
const { default: mongoose } = require("mongoose");

//create Courier Order
exports.createOrderCourier = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new customError(401, "Invalid Order-Id");
  }

  const order = await orderModel.findById(orderId);
  if (!order) throw new customError(401, "Order Not Found!");

  const { invoiceId, shippinginfo, finalAmount } = order;

  const courierPayload = {
    invoice: invoiceId,
    recipient_name: shippinginfo.firstName,
    recipient_phone: shippinginfo.phone,
    recipient_address: shippinginfo.address,
    cod_amount: finalAmount,
  };

  const response = await api.post("/create_order", courierPayload);

  if (!response.data || response.data.status !== 200) {
    throw new customError(
      401,
      "Failed to create courier order please try again"
    );
  }

  const { consignment } = response.data;

  order.courier.name = "Steadfast";
  order.courier.trackingId = consignment.tracking_code;
  order.courier.rawResponse = consignment;
  order.courier.status = consignment.status;
  order.orderStatus = consignment.status;
  await order.save();

  apiResponse.sendsuccess(
    res,
    201,
    "Courier Order Has Been Created Successfully",
    {
      trackingId: consignment.tracking_code,
      message: response.data.message,
      consignment,
    }
  );
});

//create bulk orders
exports.createBulkOrderCourier = asyncHandler(async (req, res) => {
  const { orderIds } = req.body;

  // Basic validation
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    throw new customError(400, "orderIds must be a non-empty array");
  }

  // Validate each id quickly (so we can fail early for bad ids)
  const invalidIds = orderIds.filter(
    (id) => !mongoose.Types.ObjectId.isValid(id)
  );
  if (invalidIds.length) {
    throw new customError(
      400,
      `Invalid Mongo ObjectId(s): ${invalidIds.join(", ")}`
    );
  }

  // Fetch orders that match the provided ids
  const orders = await orderModel.find({ _id: { $in: orderIds } }).lean();

  // prepare a map for fast lookup
  const ordersMap = new Map(orders.map((o) => [String(o._id), o]));

  // We'll collect results per order
  const results = [];

  // Create tasks for each orderId - perform concurrently but handle each result
  const tasks = orderIds.map((id) =>
    (async () => {
      // If order not found in DB
      const order = ordersMap.get(String(id));
      if (!order) {
        return {
          orderId: id,
          status: "failed",
          reason: "Order not found",
        };
      }

      // If courier already created (tracking exists), skip to avoid duplicates
      if (order.courier && order.courier.trackingId) {
        return {
          orderId: id,
          status: "skipped",
          reason: "Courier already created",
          trackingId: order.courier.trackingId,
        };
      }

      // Build payload (same fields as single controller)
      const { invoiceId, shippinginfo, finalAmount } = order;

      const courierPayload = {
        invoice: invoiceId,
        recipient_name: shippinginfo?.firstName || shippinginfo?.name || "",
        recipient_phone: shippinginfo?.phone,
        recipient_address: shippinginfo?.address,
        cod_amount: finalAmount,
      };

      try {
        const response = await api.post("/create_order", courierPayload);

        if (!response?.data || response.data.status !== 200) {
          // API responded but with failure
          return {
            orderId: id,
            status: "failed",
            reason:
              response?.data?.message ||
              "Courier API returned non-success status",
            raw: response?.data ?? null,
          };
        }

        const { consignment } = response.data;

        // Update the order in DB (use findByIdAndUpdate to avoid stale data from .lean())
        const updated = await orderModel
          .findByIdAndUpdate(
            id,
            {
              $set: {
                "courier.name": "Steadfast",
                "courier.trackingId": consignment.tracking_code,
                "courier.status": consignment.status,
                orderStatus: consignment.status,
              },
            },
            { new: true }
          )
          .lean();

        return {
          orderId: id,
          status: "success",
          trackingId: consignment.tracking_code,
          consignment,
          message: response.data.message,
          updatedOrder: updated
            ? { _id: updated._id, courier: updated.courier }
            : null,
        };
      } catch (err) {
        // network / unexpected error for this order
        return {
          orderId: id,
          status: "failed",
          reason: err.message || "Unexpected error when calling courier API",
          error: err?.response?.data ?? null,
        };
      }
    })()
  );

  // Run all tasks concurrently and collect results
  const settled = await Promise.allSettled(tasks);

  // Normalize settled results (task wrapper returns an object or throws - we handle both)
  for (const s of settled) {
    if (s.status === "fulfilled") {
      results.push(s.value);
    } else {
      // should be rare because inner function catches most errors, but handle just in case
      results.push({
        orderId: null,
        status: "failed",
        reason: "Unhandled task error",
        error: s.reason?.message || s.reason,
      });
    }
  }

  // Summarize
  const summary = results.reduce(
    (acc, r) => {
      acc.total += 1;
      if (r.status === "success") acc.success += 1;
      else if (r.status === "skipped") acc.skipped += 1;
      else acc.failed += 1;
      return acc;
    },
    { total: 0, success: 0, skipped: 0, failed: 0 }
  );

  // Send response (include detailed per-order results)
  return apiResponse.sendsuccess(res, 200, "Bulk courier create processed", {
    summary,
    results,
  });
});

//checking delivery status
exports.checkingDeliveryStatus = asyncHandler(async (req, res) => {
  const { trackingId } = req.query;
  const response = await api.get(`/status_by_trackingcode/${trackingId}`);
  if (!response.data || response.data.status !== 200) {
    throw new customError(500, "Failed to fetch delivery status");
  }
  apiResponse.sendsuccess(
    res,
    200,
    "Delivery status fetched successfully",
    response.data
  );
});

//get balance
exports.getCurrentBalance = asyncHandler(async (req, res) => {
  const response = await api.get("/get_balance");
  if (!response.data || response.data.status !== 200) {
    throw new customError(500, "Failed to fetch current balance");
  }
  apiResponse.sendsuccess(
    res,
    200,
    "Current balance fetched successfully",
    response.data
  );
});

//courier return request
exports.createReturnRequest = asyncHandler(async (req, res) => {
  const { consignment_id } = req.body;

  if (!consignment_id) {
    throw new customError(400, "Consignment ID is required");
  }
  const response = await api.post("/create_return_request", {
    consignment_id,
    reason: "Customer Request",
  });

  if (!response.data) {
    throw new customError(500, "Failed to create return request");
  }

  // find order and update its status
  const order = await orderModel.findOne({
    invoiceId: response.data.consignment.invoice,
  });
  if (!order) {
    throw new customError(404, "Order not found");
  }
  order.returnStatus = "requested";
  order.returnId = response.data.id;
  order.orderStatus = response.data.status;
  order.returnStatusHistory = response.data;

  await order.save();
  apiResponse.sendsuccess(
    res,
    200,
    "Return request created successfully",
    response.data
  );
});

//Get Single returm request
exports.getReturnRequestStatus = asyncHandler(async (req, res) => {
  const { returnId } = req.query;
  if (!returnId) {
    throw new customError(400, "Return ID is required");
  }
  const response = await api.get(`/get_return_request/${returnId}`);
  if (!response.data) {
    throw new customError(500, "Failed to fetch return request status");
  }
  apiResponse.sendsuccess(
    res,
    200,
    "Return request status fetched successfully",
    response.data
  );
});

//SteadFast webhook

exports.steadfastWebhookHandler = asyncHandler(async (req, res) => {
  const payload = req.body;
  const token = process.env.WEBHOOK_TOKEN;
  console.log("Steadfast Webhook Payload:", payload);
});
