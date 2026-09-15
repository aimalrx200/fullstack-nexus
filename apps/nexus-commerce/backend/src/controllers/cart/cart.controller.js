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

      // Apply upper cap limits if configured
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

export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const guestSessionId = req.headers["x-guest-session-id"];

  const cart = await Cart.findOne({
    $or: [
      { ...(userId && { userId }) },
      { ...(guestSessionId && { guestSessionId }) },
    ],
  })
    .populate("items.productId")
    .populate("items.variantId");

  if (!cart) {
    return res.status(200).json({
      success: true,
      cart: { items: [] },
      totals: calculateCartTotals(null),
    });
  }

  const totals = calculateCartTotals(cart);
  return res.status(200).json({ success: true, cart, totals });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { variantId, quantity = 1 } = req.body;
  const userId = req.user?.id;
  const guestSessionId = req.headers["x-guest-session-id"];

  const variant = await Variant.findById(variantId).populate("productId");
  if (!variant || variant.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: "Requested quantity exceeds available stock.",
    });
  }

  let cart = await Cart.findOne({
    $or: [
      { ...(userId && { userId }) },
      { ...(guestSessionId && { guestSessionId }) },
    ],
  });

  if (!cart) {
    cart = new Cart({ userId, guestSessionId, items: [] });
  }

  const existingIndex = cart.items.findIndex(
    (item) => item.variantId.toString() === variantId,
  );

  if (existingIndex > -1) {
    const newQty = cart.items[existingIndex].quantity + quantity;
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
      quantity,
      priceAtAdditionUSD:
        variant.priceOverrideUSD || variant.productId.basePriceUSD,
      priceAtAdditionPKR:
        variant.priceOverridePKR || variant.productId.basePricePKR,
    });
  }

  await cart.save();
  const populated = await cart.populate("items.productId items.variantId");
  const totals = calculateCartTotals(populated);

  return res.status(200).json({ success: true, cart: populated, totals });
});

export const updateCartItemQuantity = asyncHandler(async (req, res) => {
  const { variantId } = req.params;
  const { quantity } = req.body;
  const userId = req.user?.id;
  const guestSessionId = req.headers["x-guest-session-id"];

  const cart = await Cart.findOne({
    $or: [
      { ...(userId && { userId }) },
      { ...(guestSessionId && { guestSessionId }) },
    ],
  });

  if (!cart)
    return res.status(404).json({ success: false, message: "Cart not found." });

  if (Number(quantity) <= 0) {
    cart.items = cart.items.filter(
      (item) => item.variantId.toString() !== variantId,
    );
  } else {
    const variant = await Variant.findById(variantId);
    if (!variant || variant.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock.",
      });
    }

    const item = cart.items.find((i) => i.variantId.toString() === variantId);
    if (item) item.quantity = Number(quantity);
  }

  await cart.save();
  const populated = await cart.populate("items.productId items.variantId");
  const totals = calculateCartTotals(populated);

  return res.status(200).json({ success: true, cart: populated, totals });
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const { variantId } = req.params;
  const userId = req.user?.id;
  const guestSessionId = req.headers["x-guest-session-id"];

  const cart = await Cart.findOne({
    $or: [
      { ...(userId && { userId }) },
      { ...(guestSessionId && { guestSessionId }) },
    ],
  });

  if (cart) {
    cart.items = cart.items.filter(
      (item) => item.variantId.toString() !== variantId,
    );
    await cart.save();
  }

  const populated = await cart?.populate("items.productId items.variantId");
  const totals = calculateCartTotals(populated);

  return res
    .status(200)
    .json({ success: true, cart: populated || { items: [] }, totals });
});

/**
 * Validates and applies dynamic database coupon
 */
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const userId = req.user?.id;
  const guestSessionId = req.headers["x-guest-session-id"];

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

  // Per-user usage verification
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

  const cart = await Cart.findOne({
    $or: [
      { ...(userId && { userId }) },
      { ...(guestSessionId && { guestSessionId }) },
    ],
  });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty." });
  }

  // Check minimum order amount threshold
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
        const existingIndex = userCart.items.findIndex(
          (item) =>
            item.variantId.toString() === guestItem.variantId.toString(),
        );

        if (existingIndex > -1) {
          userCart.items[existingIndex].quantity += guestItem.quantity;
        } else {
          userCart.items.push(guestItem);
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
