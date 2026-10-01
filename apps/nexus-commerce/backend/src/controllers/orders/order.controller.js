// apps/nexus-commerce/backend/src/controllers/orders/order.controller.js

import mongoose from "mongoose";
import { Order, Cart, Coupon } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { PaymentGatewayFactory } from "#gateways/PaymentGatewayFactory.js";
import { calculateShippingQuote } from "#services/googleMapsService.js";
import { broadcastNewOrder } from "#websockets/wsBroadcaster.js";
import { enqueueJob, JOB_TYPES } from "#services/jobQueue.js";
import currency from "currency.js";
import { commitInventoryDeduction } from "#services/inventoryLockService.js";

/**
 * Creates a new order from an active Cart (Guest or Authenticated)
 * POST /api/v1/orders
 */
export const createOrder = asyncHandler(async (req, res) => {
  const {
    cartId,
    customerEmail,
    customerPhone,
    paymentMethod,
    shippingAddress,
    mobileNumber,
    idempotencyKey,
  } = req.body;

  const userId = req.user?.id;
  const headerGuestId = req.headers["x-guest-session-id"];
  const bodyGuestId =
    typeof cartId === "string" && cartId.startsWith("guest_") ? cartId : null;
  const guestSessionId = headerGuestId || bodyGuestId;

  // 1. Robust Multi-Tier Cart Lookup
  const cartQuery = [];

  const isObjectId =
    typeof cartId === "string" && mongoose.Types.ObjectId.isValid(cartId);

  if (isObjectId) {
    cartQuery.push({ _id: cartId });
  }
  if (userId) {
    cartQuery.push({ userId });
  }
  if (guestSessionId) {
    cartQuery.push({ guestSessionId });
  }
  if (!isObjectId && typeof cartId === "string" && cartId !== "active_cart") {
    cartQuery.push({ guestSessionId: cartId });
  }

  let cart = await Cart.findOne({
    $or: cartQuery.length > 0 ? cartQuery : [{ _id: null }],
  }).populate("items.productId items.variantId");

  // Fallback: If user is authenticated, but their items were added as a guest
  if ((!cart || !cart.items || cart.items.length === 0) && headerGuestId) {
    cart = await Cart.findOne({ guestSessionId: headerGuestId }).populate(
      "items.productId items.variantId",
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Your shopping bag is empty." });
  }

  const isPKR = shippingAddress.countryCode === "PK";
  const currencyCode = isPKR ? "PKR" : "USD";

  // Server-Authoritative Price Calculation for both currencies
  let subtotalUSD = currency(0);
  let subtotalPKR = currency(0);
  const orderItems = [];

  for (const item of cart.items) {
    const variant = item.variantId;
    const product = item.productId;

    if (!variant || !product) continue;

    const unitPriceUSD = variant.priceOverrideUSD || product.basePriceUSD || 0;
    const unitPricePKR =
      variant.priceOverridePKR || product.basePricePKR || unitPriceUSD * 280;

    subtotalUSD = subtotalUSD.add(
      currency(unitPriceUSD).multiply(item.quantity),
    );
    subtotalPKR = subtotalPKR.add(
      currency(unitPricePKR).multiply(item.quantity),
    );

    orderItems.push({
      productId: product._id,
      variantId: variant._id,
      sku: variant.sku,
      title: product.title,
      variantTitle: variant.title,
      image: variant.image || product.images?.[0]?.url,
      unitPriceUSD,
      unitPricePKR,
      quantity: item.quantity,
      totalUSD: currency(unitPriceUSD).multiply(item.quantity).value,
      totalPKR: currency(unitPricePKR).multiply(item.quantity).value,
    });
  }

  const shippingQuote = await calculateShippingQuote({
    destinationAddress: `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.country}`,
    destinationCity: shippingAddress.city,
    destinationCoordinates: shippingAddress.coordinates,
  });

  const shippingFeeUSD = shippingQuote.shippingFeeUSD || 2.5;
  const shippingFeePKR = shippingQuote.shippingFeePKR || 350;

  let discountUSD = currency(0);
  let discountPKR = currency(0);
  if (cart.appliedCoupon?.discountPercent > 0) {
    discountUSD = subtotalUSD.multiply(
      cart.appliedCoupon.discountPercent / 100,
    );
    discountPKR = subtotalPKR.multiply(
      cart.appliedCoupon.discountPercent / 100,
    );
  }

  const grandTotalUSD = subtotalUSD
    .add(shippingFeeUSD)
    .subtract(discountUSD).value;
  const grandTotalPKR = subtotalPKR
    .add(shippingFeePKR)
    .subtract(discountPKR).value;
  const orderNumber = `NEX-${Date.now().toString().slice(-6)}`;

  const order = await Order.create({
    orderNumber,
    userId: req.user?.id,
    customerEmail: customerEmail.toLowerCase().trim(),
    customerPhone,
    items: orderItems,
    shippingAddress: {
      ...shippingAddress,
      coordinates: shippingQuote.destinationCoordinates,
    },
    pricing: {
      currency: currencyCode,
      subtotalUSD: subtotalUSD.value,
      subtotalPKR: subtotalPKR.value,
      shippingFeeUSD,
      shippingFeePKR,
      discountUSD: discountUSD.value,
      discountPKR: discountPKR.value,
      totalUSD: grandTotalUSD,
      totalPKR: grandTotalPKR,
      // Charged amount
      subtotal: isPKR ? subtotalPKR.value : subtotalUSD.value,
      shippingFee: isPKR ? shippingFeePKR : shippingFeeUSD,
      discount: isPKR ? discountPKR.value : discountUSD.value,
      total: isPKR ? grandTotalPKR : grandTotalUSD,
    },
    paymentMethod,
    paymentStatus: "pending",
    fulfillmentStatus: paymentMethod === "cod" ? "confirmed" : "unfulfilled",
    timeline: [
      {
        status: "Order Created",
        note: `Order booked via ${paymentMethod.toUpperCase()}`,
        triggeredBy: req.user?.name || "customer",
      },
    ],
  });

  if (paymentMethod === "cod") {
    // Deduct physical warehouse stock immediately for Cash on Delivery booking
    await commitInventoryDeduction(order.items);
  }

  // Atomically increment coupon usage if applied
  if (cart.appliedCoupon?.code) {
    await Coupon.findOneAndUpdate(
      { code: cart.appliedCoupon.code },
      {
        $inc: { currentUsageCount: 1 },
        ...(req.user?.id && {
          $push: {
            usedBy: {
              userId: req.user.id,
              orderId: order._id,
              usedAt: new Date(),
            },
          },
        }),
      },
    );
  }

  const gateway = PaymentGatewayFactory.getAdapter(paymentMethod);
  const paymentResult = await gateway.initiatePayment({
    order,
    mobileNumber,
    idempotencyKey,
  });

  // Emit live order to merchant radar stream
  broadcastNewOrder(order);

  // Enqueue email receipt in background
  await enqueueJob(JOB_TYPES.SEND_ORDER_RECEIPT, order);

  // Safely delete the cart using its verified MongoDB ObjectId
  await Cart.findByIdAndDelete(cart._id);

  return res.status(201).json({
    success: true,
    order,
    payment: paymentResult,
  });
});

/**
 * Retrieves a single order by ObjectId or orderNumber with permission guards
 * GET /api/v1/orders/:orderId
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const queryEmail = (req.query.email || req.headers["x-customer-email"] || "")
    .trim()
    .toLowerCase();

  const isObjectId =
    typeof orderId === "string" && mongoose.Types.ObjectId.isValid(orderId);

  const order = await Order.findOne({
    $or: [...(isObjectId ? [{ _id: orderId }] : []), { orderNumber: orderId }],
  });

  if (!order) {
    return res
      .status(404)
      .json({ success: false, message: "Order not found." });
  }

  const isStaff = ["support_agent", "merchant_admin", "super_admin"].includes(
    req.user?.role,
  );
  const isRegisteredOwner =
    req.user && order.userId && req.user.id === order.userId.toString();
  const isGuestVerified =
    !order.userId &&
    queryEmail &&
    queryEmail === order.customerEmail.toLowerCase();
  const isGuestDirectLookup = !order.userId;

  if (
    !isStaff &&
    !isRegisteredOwner &&
    !isGuestVerified &&
    !isGuestDirectLookup
  ) {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized access to order." });
  }

  return res.status(200).json({ success: true, order });
});

/**
 * Retrieves paginated orders for the authenticated customer
 * GET /api/v1/orders/my-orders
 */
export const getCustomerOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const query = { userId: req.user.id };

  const [orders, totalCount] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    orders,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit),
      hasMore: page * limit < totalCount,
    },
  });
});
