import { Order, Cart, Coupon } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { PaymentGatewayFactory } from "#gateways/PaymentGatewayFactory.js";
import { calculateShippingQuote } from "#services/googleMapsService.js";
import { broadcastNewOrder } from "#websockets/wsBroadcaster.js";
import { enqueueJob, JOB_TYPES } from "#services/jobQueue.js";
import currency from "currency.js";

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

  const cart = await Cart.findById(cartId).populate(
    "items.productId items.variantId",
  );
  if (!cart || cart.items.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Your cart is empty." });
  }

  const isPKR = shippingAddress.countryCode === "PK";
  const currencyCode = isPKR ? "PKR" : "USD";

  // Server-Authoritative Price Calculation
  let subtotal = currency(0);
  const orderItems = [];

  for (const item of cart.items) {
    const variant = item.variantId;
    const product = item.productId;

    const unitPrice = isPKR
      ? variant.priceOverridePKR || product.basePricePKR
      : variant.priceOverrideUSD || product.basePriceUSD;

    const lineTotal = currency(unitPrice).multiply(item.quantity);
    subtotal = subtotal.add(lineTotal);

    orderItems.push({
      productId: product._id,
      variantId: variant._id,
      sku: variant.sku,
      title: product.title,
      variantTitle: variant.title,
      image: variant.image || product.images[0]?.url,
      unitPriceUSD: variant.priceOverrideUSD || product.basePriceUSD,
      unitPricePKR: variant.priceOverridePKR || product.basePricePKR,
      quantity: item.quantity,
      totalUSD: currency(
        variant.priceOverrideUSD || product.basePriceUSD,
      ).multiply(item.quantity).value,
      totalPKR: currency(
        variant.priceOverridePKR || product.basePricePKR,
      ).multiply(item.quantity).value,
    });
  }

  const shippingQuote = await calculateShippingQuote({
    destinationAddress: `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.country}`,
    destinationCity: shippingAddress.city,
    destinationCoordinates: shippingAddress.coordinates,
  });

  const shippingFee = currency(
    isPKR ? shippingQuote.shippingFeePKR : shippingQuote.shippingFeeUSD,
  );

  let discount = currency(0);
  if (cart.appliedCoupon?.discountPercent > 0) {
    discount = subtotal.multiply(cart.appliedCoupon.discountPercent / 100);
  }

  const grandTotal = subtotal.add(shippingFee).subtract(discount).value;
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
      subtotal: subtotal.value,
      shippingFee: shippingFee.value,
      discount: discount.value,
      total: grandTotal,
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

  // Atomically increment coupon usage and record user redemption
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

  // Emit live order to merchant stream
  broadcastNewOrder(order);

  // Enqueue email receipt to background worker (non-blocking)
  await enqueueJob(JOB_TYPES.SEND_ORDER_RECEIPT, order);

  await Cart.findByIdAndDelete(cartId);

  return res.status(201).json({
    success: true,
    order,
    payment: paymentResult,
  });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const queryEmail = (req.query.email || req.headers["x-customer-email"] || "")
    .trim()
    .toLowerCase();

  const order = await Order.findOne({
    $or: [
      { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null },
      { orderNumber: orderId },
    ].filter(Boolean),
  });

  if (!order) {
    return res
      .status(404)
      .json({ success: false, message: "Order not found." });
  }

  const isAdmin = req.user?.role === "merchant_admin";
  const isRegisteredOwner =
    req.user && order.userId && req.user.id === order.userId.toString();
  const isGuestVerified =
    !order.userId &&
    queryEmail &&
    queryEmail === order.customerEmail.toLowerCase();

  if (!isAdmin && !isRegisteredOwner && !isGuestVerified) {
    if (!order.userId && !queryEmail) {
      return res.status(401).json({
        success: false,
        message:
          "Email verification required to view guest order details. Pass ?email=youremail@domain.com",
      });
    }

    return res
      .status(403)
      .json({ success: false, message: "Unauthorized access to order." });
  }

  return res.status(200).json({ success: true, order });
});

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
