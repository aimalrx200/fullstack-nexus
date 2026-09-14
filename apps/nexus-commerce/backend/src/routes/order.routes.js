import { Router } from "express";
import {
  createOrder,
  getOrderById,
  getCustomerOrders,
} from "#controllers/orders/order.controller.js";
import { authMiddleware } from "#middlewares/authMiddleware.js";
import { enforceIdempotency } from "#middlewares/idempotency.js";
import { validate } from "#middlewares/validate.js";
import { CreateOrderSchema } from "#validations/checkout.validation.js";

const router = Router();

// Idempotent Order Creation
router.post("/", enforceIdempotency, validate(CreateOrderSchema), createOrder);

// Customer Order History
router.get("/my-orders", authMiddleware, getCustomerOrders);

// Public / Authenticated Order Tracking Lookup
router.get("/:orderId", getOrderById);

export default router;
