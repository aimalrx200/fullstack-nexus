// apps/nexus-commerce/backend/src/controllers/admin/orderFulfillment.controller.js

import { Order } from "#models/index.js";
import { transitionOrderStatus } from "#services/orderFSMService.js";
import {
  broadcastCourierLocation,
  broadcastOrderStatusUpdate,
} from "#websockets/wsBroadcaster.js";
import { asyncHandler } from "#utils/asyncHandler.js";

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
    triggeredBy: req.user?.name || "merchant_admin",
  });

  return res.status(200).json({ success: true, order });
});

export const assignCourierTracking = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { carrier, trackingNumber, estimatedDelivery } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    return res
      .status(404)
      .json({ success: false, message: "Order not found." });
  }

  order.courier = {
    carrier: carrier || "TCS",
    trackingNumber: trackingNumber || `TRK-${Date.now().toString().slice(-6)}`,
    dispatchDate: new Date(),
    estimatedDelivery: estimatedDelivery
      ? new Date(estimatedDelivery)
      : new Date(Date.now() + 2 * 86400000),
    currentLocation: {
      lat: 31.5204,
      lng: 74.3587,
      label: `Dispatched with ${carrier || "TCS Express"}`,
    },
  };
  order.fulfillmentStatus = "dispatched";
  order.timeline.push({
    status: "DISPATCHED",
    note: `Assigned courier ${carrier} (Tracking #${order.courier.trackingNumber})`,
    timestamp: new Date(),
    triggeredBy: req.user?.name || "merchant_admin",
  });

  await order.save();

  // Broadcast location & status simultaneously
  broadcastCourierLocation(
    order._id,
    order.courier.currentLocation,
    `Dispatched with ${carrier}`,
  );
  broadcastOrderStatusUpdate(order._id, "dispatched", order.timeline);

  return res.status(200).json({ success: true, order });
});

export const simulateCourierDelivery = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);
  if (!order) {
    return res
      .status(404)
      .json({ success: false, message: "Order not found." });
  }

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
    order.timeline.push({
      status: "DISPATCHED",
      note: "Dispatched from fulfillment center",
      timestamp: new Date(),
      triggeredBy: "simulator",
    });
    await order.save();
    broadcastOrderStatusUpdate(order._id, "dispatched", order.timeline);
  }

  const origin = {
    lat: 31.5204,
    lng: 74.3587,
    label: "Fulfillment Center (Gulberg III)",
  };

  const destination = order.shippingAddress?.coordinates?.lat
    ? {
        lat: order.shippingAddress.coordinates.lat,
        lng: order.shippingAddress.coordinates.lng,
        label: `${order.shippingAddress.street}, ${order.shippingAddress.city}`,
      }
    : { lat: 31.4697, lng: 74.2728, label: "Customer Residence (DHA Phase 5)" };

  const waypoints = [];
  const steps = 8;

  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
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

  waypoints.forEach((wp, index) => {
    setTimeout(async () => {
      broadcastCourierLocation(order._id, wp.coordinates, wp.statusLabel);

      if (wp.step === waypoints.length) {
        const finalOrder = await Order.findById(order._id);
        if (finalOrder) {
          finalOrder.fulfillmentStatus = "delivered";
          finalOrder.courier.currentLocation = {
            ...wp.coordinates,
            label: wp.statusLabel,
          };
          finalOrder.timeline.push({
            status: "DELIVERED",
            note: "Package handed over to customer",
            timestamp: new Date(),
            triggeredBy: "courier_gps",
          });
          await finalOrder.save();
          // ⚡ Final live delivery broadcast
          broadcastOrderStatusUpdate(
            finalOrder._id,
            "delivered",
            finalOrder.timeline,
          );
        }
      }
    }, index * 2000);
  });

  return res.status(200).json({
    success: true,
    message: "Live courier delivery simulation started.",
    waypointsCount: waypoints.length,
  });
});
