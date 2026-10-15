// apps/nexus-commerce/backend/src/controllers/cart/cart.controller.js

import { Cart, Variant, Coupon } from "#models/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import currency from "currency.js";

export const calculateCartTotals = (cart) => {
  if (!cart || !cart.items || cart.items.length === 0) {
    return {
      subtotalUSD: 0,
      subtotalPKR: 0,
      discountUSD: 0,
      discountPKR: 0,
      totalUSD: 0,
      totalPKR: 0,
      itemCount: 0,
    };
  }

  let subtotalUSD = currency(0);
  let subtotalPKR = currency(0);

  cart.items.forEach((item) => {
    subtotalUSD = subtotalUSD.add(
      currency(item.priceAtAdditionUSD).multiply(item.quantity),
    );
    subtotalPKR = subtotalPKR.add(
      currency(item.priceAtAdditionPKR).multiply(item.quantity),
    );
  });

  let discountUSD = currency(0);
  let discountPKR = currency(0);

  if (cart.appliedCoupon) {
    const {
      discountType,
      discountPercent,
      discountAmountUSD,
      discountAmountPKR,
      maxDiscountUSD,
      maxDiscountPKR,
    } = cart.appliedCoupon;

    if (discountType === "percentage" && discountPercent > 0) {
      discountUSD = subtotalUSD.multiply(discountPercent / 100);
      discountPKR = subtotalPKR.multiply(discountPercent / 100);

      if (maxDiscountUSD && discountUSD.value > maxDiscountUSD) {
        discountUSD = currency(maxDiscountUSD);
      }
      if (maxDiscountPKR && discountPKR.value > maxDiscountPKR) {
        discountPKR = currency(maxDiscountPKR);
      }
    } else if (discountType === "fixed_amount") {
      discountUSD = currency(
        Math.min(subtotalUSD.value, discountAmountUSD || 0),
      );
      discountPKR = currency(
        Math.min(subtotalPKR.value, discountAmountPKR || 0),
      );
    }
  }

  const totalUSD = Math.max(0, subtotalUSD.subtract(discountUSD).value);
  const totalPKR = Math.max(0, subtotalPKR.subtract(discountPKR).value);

  return {
    subtotalUSD: subtotalUSD.value,
    subtotalPKR: subtotalPKR.value,
    discountUSD: discountUSD.value,
    discountPKR: discountPKR.value,
    totalUSD,
    totalPKR,
    itemCount: cart.items.reduce((acc, item) => acc + item.quantity, 0),
  };
};

/**
 * Deterministically resolves the active cart query.
 * Authenticated users must query ONLY by userId to prevent random guest cart collisions.
 */
const resolveCartQuery = (req) => {
  const userId = req.user?.id;
  const guestSessionId =
    req.headers["x-guest-session-id"] || req.body?.guestSessionId;

  if (userId) {
    return { query: { userId }, isGuest: false, guestSessionId: null };
  }

  const resolvedGuestId =
    guestSessionId ||
    `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  return {
    query: { guestSessionId: resolvedGuestId },
    isGuest: true,
    guestSessionId: resolvedGuestId,
  };
};

export const getCart = asyncHandler(async (req, res) => {
  const { query, guestSessionId, isGuest } = resolveCartQuery(req);

  const cart = await Cart.findOne(query)
    .populate("items.productId")
    .populate("items.variantId");

  if (isGuest && guestSessionId) {
    res.setHeader("x-guest-session-id", guestSessionId);
  }

  if (!cart) {
    return res.status(200).json({
      success: true,
      guestSessionId: isGuest ? guestSessionId : null,
      cart: { _id: null, items: [] },
      totals: calculateCartTotals(null),
    });
  }

  const totals = calculateCartTotals(cart);
  return res.status(200).json({
    success: true,
    guestSessionId: isGuest ? guestSessionId : null,
    cart,
    totals,
  });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { variantId, quantity = 1 } = req.body;
  const numQuantity = Math.max(1, Number(quantity) || 1);
  const { query, isGuest, guestSessionId } = resolveCartQuery(req);

  const cleanVariantId =
    typeof variantId === "object" ? variantId._id || variantId.id : variantId;

  const variant = await Variant.findById(cleanVariantId).populate("productId");
  if (!variant || variant.stock < numQuantity) {
    return res.status(400).json({
      success: false,
      message: "Requested quantity exceeds available stock.",
    });
  }

  let cart = await Cart.findOne(query);

  if (!cart) {
    cart = new Cart({
      ...(req.user?.id ? { userId: req.user.id } : { guestSessionId }),
      items: [],
    });
  }

  const existingIndex = cart.items.findIndex(
    (item) => item.variantId?.toString() === cleanVariantId.toString(),
  );

  if (existingIndex > -1) {
    const newQty = cart.items[existingIndex].quantity + numQuantity;
    if (newQty > variant.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${variant.stock} units available in stock.`,
      });
    }
    cart.items[existingIndex].quantity = newQty;
  } else {
    cart.items.push({
      productId: variant.productId._id,
      variantId: variant._id,
      quantity: numQuantity,
      priceAtAdditionUSD:
        variant.priceOverrideUSD || variant.productId.basePriceUSD,
      priceAtAdditionPKR:
        variant.priceOverridePKR || variant.productId.basePricePKR,
    });
  }

  await cart.save();
  const populated = await cart.populate("items.productId items.variantId");
  const totals = calculateCartTotals(populated);

  if (isGuest && guestSessionId) {
    res.setHeader("x-guest-session-id", guestSessionId);
  }

  return res.status(200).json({
    success: true,
    guestSessionId: isGuest ? guestSessionId : null,
    cart: populated,
    totals,
  });
});

export const updateCartItemQuantity = asyncHandler(async (req, res) => {
  const { variantId } = req.params;
  const { quantity } = req.body;
  const numQuantity = Number(quantity);
  const { query } = resolveCartQuery(req);

  const cleanVariantId =
    typeof variantId === "object" ? variantId._id || variantId.id : variantId;

  const cart = await Cart.findOne(query);

  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found." });
  }

  if (numQuantity <= 0) {
    cart.items = cart.items.filter(
      (item) => item.variantId?.toString() !== cleanVariantId.toString(),
    );
  } else {
    const variant = await Variant.findById(cleanVariantId);
    if (!variant || variant.stock < numQuantity) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock.",
      });
    }

    const item = cart.items.find(
      (i) => i.variantId?.toString() === cleanVariantId.toString(),
    );
    if (item) item.quantity = numQuantity;
  }

  await cart.save();
  const populated = await cart.populate("items.productId items.variantId");
  const totals = calculateCartTotals(populated);

  return res.status(200).json({ success: true, cart: populated, totals });
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const { variantId } = req.params;
  const { query } = resolveCartQuery(req);

  const cleanVariantId =
    typeof variantId === "object" ? variantId._id || variantId.id : variantId;

  const cart = await Cart.findOne(query);

  if (cart) {
    cart.items = cart.items.filter(
      (item) => item.variantId?.toString() !== cleanVariantId.toString(),
    );
    await cart.save();
  }

  const populated = await cart?.populate("items.productId items.variantId");
  const totals = calculateCartTotals(populated);

  return res
    .status(200)
    .json({ success: true, cart: populated || { items: [] }, totals });
});

export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const { query } = resolveCartQuery(req);
  const userId = req.user?.id;

  const cleanCode = code?.toUpperCase().trim();
  const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });

  if (!coupon) {
    return res.status(400).json({
      success: false,
      message: "Invalid or inactive coupon code.",
    });
  }

  const now = new Date();
  if (coupon.validFrom && now < new Date(coupon.validFrom)) {
    return res.status(400).json({
      success: false,
      message: "This promotional code is not yet active.",
    });
  }

  if (coupon.validUntil && now > new Date(coupon.validUntil)) {
    return res.status(400).json({
      success: false,
      message: "This promotional code has expired.",
    });
  }

  if (
    coupon.maxUsageTotal &&
    coupon.currentUsageCount >= coupon.maxUsageTotal
  ) {
    return res.status(400).json({
      success: false,
      message: "Coupon redemption limit reached.",
    });
  }

  if (userId) {
    const userUsage = coupon.usedBy.filter(
      (u) => u.userId.toString() === userId.toString(),
    ).length;
    if (userUsage >= coupon.perUserLimit) {
      return res.status(400).json({
        success: false,
        message: `You have already redeemed this coupon the maximum allowed times (${coupon.perUserLimit}).`,
      });
    }
  }

  const cart = await Cart.findOne(query);

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty." });
  }

  const currentSubtotalUSD = cart.items.reduce(
    (acc, i) => acc + i.priceAtAdditionUSD * i.quantity,
    0,
  );

  if (
    coupon.minOrderAmountUSD > 0 &&
    currentSubtotalUSD < coupon.minOrderAmountUSD
  ) {
    return res.status(400).json({
      success: false,
      message: `Minimum order amount of $${coupon.minOrderAmountUSD} required for this coupon.`,
    });
  }

  cart.appliedCoupon = {
    code: coupon.code,
    discountType: coupon.discountType,
    discountPercent: coupon.discountPercent,
    discountAmountUSD: coupon.discountAmountUSD,
    discountAmountPKR: coupon.discountAmountPKR,
    maxDiscountUSD: coupon.maxDiscountUSD,
    maxDiscountPKR: coupon.maxDiscountPKR,
  };

  await cart.save();

  const populated = await cart.populate("items.productId items.variantId");
  const totals = calculateCartTotals(populated);

  return res.status(200).json({
    success: true,
    message: `Coupon '${coupon.code}' applied successfully!`,
    cart: populated,
    totals,
  });
});

export const mergeGuestCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { guestSessionId } = req.body;

  let userCart = await Cart.findOne({ userId });
  if (!userCart) {
    userCart = new Cart({ userId, items: [] });
  }

  if (guestSessionId) {
    const guestCart = await Cart.findOne({ guestSessionId });
    if (guestCart && guestCart.items.length > 0) {
      for (const guestItem of guestCart.items) {
        const guestVariantId = guestItem.variantId.toString();
        const existingIndex = userCart.items.findIndex(
          (item) => item.variantId?.toString() === guestVariantId,
        );

        if (existingIndex > -1) {
          userCart.items[existingIndex].quantity += guestItem.quantity;
        } else {
          userCart.items.push({
            productId: guestItem.productId,
            variantId: guestItem.variantId,
            quantity: guestItem.quantity,
            priceAtAdditionUSD: guestItem.priceAtAdditionUSD,
            priceAtAdditionPKR: guestItem.priceAtAdditionPKR,
          });
        }
      }
      await userCart.save();
      await Cart.findByIdAndDelete(guestCart._id);
    }
  }

  const populated = await userCart.populate("items.productId items.variantId");
  const totals = calculateCartTotals(populated);

  return res.status(200).json({ success: true, cart: populated, totals });
});
