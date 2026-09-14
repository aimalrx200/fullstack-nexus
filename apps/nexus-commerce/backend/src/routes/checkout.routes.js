import { Router } from "express";
import {
  holdCheckoutInventory,
  getShippingQuote,
} from "#controllers/checkout/checkout.controller.js";
import { validate } from "#middlewares/validate.js";
import {
  CheckoutHoldSchema,
  ShippingQuoteSchema,
} from "#validations/checkout.validation.js";

const router = Router();

// 10-Minute Flash-Sale Inventory Hold
router.post("/hold", validate(CheckoutHoldSchema), holdCheckoutInventory);

// Dynamic Google Maps Shipping Quote Calculator
router.post("/shipping-quote", validate(ShippingQuoteSchema), getShippingQuote);

export default router;
