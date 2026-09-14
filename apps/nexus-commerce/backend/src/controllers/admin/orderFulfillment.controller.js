import { Order } from "#models/index.js";
import { transitionOrderStatus } from "#services/orderFSMService.js";
import { broadcastCourierLocation } from "#websockets/wsBroadcaster.js";
import { asyncHandler } from "#utils/asyncHandler.js";

/**
 * Server-Side Paginated Admin Order Pipeline
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 15,
    search,
    fulfillmentStatus,
    paymentStatus,
    paymentMethod,
  } = req.query;

  const parsedPage = Math.max(1, Number(page));
  const parsedLimit = Math.min(100, Math.max(1, Number(limit)));
  const skip = (parsedPage - 1) * parsedLimit;

  const query = {};

  if (fulfillmentStatus && fulfillmentStatus !== "ALL") {
    query.fulfillmentStatus = fulfillmentStatus;
  }

  if (paymentStatus && paymentStatus !== "ALL") {
    query.paymentStatus = paymentStatus;
  }

  if (paymentMethod && paymentMethod !== "ALL") {
    query.paymentMethod = paymentMethod;
  }

  if (search && search.trim()) {
    const term = search.trim();
    query.$or = [
      { orderNumber: { $regex: term, $options: "i" } },
      { customerEmail: { $regex: term, $options: "i" } },
      { "shippingAddress.recipientName": { $regex: term, $options: "i" } },
      { "shippingAddress.city": { $regex: term, $options: "i" } },
    ];
  }

  const [orders, totalCount] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    Order.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    orders,
    pagination: {
      total: totalCount,
      page: parsedPage,
      limit: parsedLimit,
      pages: Math.ceil(totalCount / parsedLimit),
      hasMore: parsedPage * parsedLimit < totalCount,
    },
  });
});

export const updateFulfillmentStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, note } = req.body;

  const order = await transitionOrderStatus({
    orderId,
    targetStatus: status,
    note,
    triggeredBy: req.user.name || "merchant_admin",
  });

  return res.status(200).json({ success: true, order });
});

export const assignCourierTracking = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { carrier, trackingNumber, estimatedDelivery } = req.body;

  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      $set: {
        "courier.carrier": carrier,
        "courier.trackingNumber": trackingNumber,
        "courier.dispatchDate": new Date(),
        "courier.estimatedDelivery": estimatedDelivery,
        fulfillmentStatus: "dispatched",
      },
    },
    { new: true },
  );

  broadcastCourierLocation(
    order._id,
    order.shippingAddress.coordinates,
    `Dispatched with ${carrier}`,
  );

  return res.status(200).json({ success: true, order });
});
