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

/**
 * Simulates real-time courier GPS movement from Warehouse Hub to Customer Destination.
 * Dispatches interpolated coordinates at 2-second intervals.
 * POST /api/v1/orders/:orderId/simulate-delivery
 */
export const simulateCourierDelivery = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);
  if (!order) {
    return res
      .status(404)
      .json({ success: false, message: "Order not found." });
  }

  // 1. Ensure order is in dispatched state
  if (
    order.fulfillmentStatus !== "dispatched" &&
    order.fulfillmentStatus !== "delivered"
  ) {
    order.fulfillmentStatus = "dispatched";
    order.courier = {
      carrier: order.courier?.carrier || "TCS Express",
      trackingNumber:
        order.courier?.trackingNumber ||
        `TRK-${Date.now().toString().slice(-6)}`,
      dispatchDate: new Date(),
    };
    await order.save();
  }

  // Origin: Central Fulfillment Hub (Lahore, PK)
  const origin = {
    lat: 31.5204,
    lng: 74.3587,
    label: "Fulfillment Center (Gulberg III)",
  };

  // Destination: Customer delivery coordinates (defaulting to destination if unpinned)
  const destination = order.shippingAddress?.coordinates?.lat
    ? {
        lat: order.shippingAddress.coordinates.lat,
        lng: order.shippingAddress.coordinates.lng,
        label: `${order.shippingAddress.street}, ${order.shippingAddress.city}`,
      }
    : { lat: 31.4697, lng: 74.2728, label: "Customer Residence (DHA Phase 5)" };

  // Generate 8 geographical waypoints along the delivery vector
  const waypoints = [];
  const steps = 8;

  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    // Add realistic courier road jitter
    const jitterLat =
      i === 0 || i === steps ? 0 : (Math.random() - 0.5) * 0.004;
    const jitterLng =
      i === 0 || i === steps ? 0 : (Math.random() - 0.5) * 0.004;

    const lat =
      origin.lat + (destination.lat - origin.lat) * fraction + jitterLat;
    const lng =
      origin.lng + (destination.lng - origin.lng) * fraction + jitterLng;

    let statusLabel = "Out for Delivery";
    if (i === 0) statusLabel = "Courier picked up parcel from hub";
    else if (i === 1) statusLabel = "En route on Main Boulevard";
    else if (i === 3) statusLabel = "Passing Transit Hub checkpoint";
    else if (i === 5) statusLabel = "Entering delivery sector";
    else if (i === 7) statusLabel = "Courier arriving at your doorstep";
    else if (i === steps) statusLabel = "Package Delivered";

    waypoints.push({
      coordinates: {
        lat: Math.round(lat * 10000) / 10000,
        lng: Math.round(lng * 10000) / 10000,
      },
      statusLabel,
      step: i + 1,
      totalSteps: steps + 1,
    });
  }

  // Asynchronously broadcast waypoints every 2.5 seconds (Non-blocking response)
  waypoints.forEach((wp, index) => {
    setTimeout(async () => {
      broadcastCourierLocation(order._id, wp.coordinates, wp.statusLabel);

      // Final step: update DB state to delivered
      if (wp.step === waypoints.length) {
        await Order.findByIdAndUpdate(order._id, {
          $set: {
            fulfillmentStatus: "delivered",
            "courier.currentLocation": {
              ...wp.coordinates,
              label: wp.statusLabel,
            },
          },
        });
      }
    }, index * 2500);
  });

  return res.status(200).json({
    success: true,
    message:
      "Live courier delivery simulation started. Dispatched 8 GPS telemetry waypoints.",
    waypointsCount: waypoints.length,
    origin,
    destination,
  });
});
