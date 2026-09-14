import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  applyCoupon,
  mergeGuestCart,
} from "#controllers/cart/cart.controller.js";
import { authMiddleware } from "#middlewares/authMiddleware.js";
import { validate } from "#middlewares/validate.js";
import { ApplyCouponSchema } from "#validations/payment.validation.js";

const router = Router();

// Cart Data & Line Item Mutations
router.get("/", getCart);
router.post("/add", addToCart);
router.patch("/items/:variantId", updateCartItemQuantity);
router.delete("/items/:variantId", removeFromCart);

// Promotional Code Application
router.post("/coupon", validate(ApplyCouponSchema), applyCoupon);

// Anonymous-to-Authenticated Cart Merging
router.post("/merge", authMiddleware, mergeGuestCart);

export default router;
