import { Router } from "express";
import { authMiddleware } from "#middlewares/authMiddleware.js";
import { adminMiddleware } from "#middlewares/adminMiddleware.js";
import { validate } from "#middlewares/validate.js";
import { getDashboardAnalytics } from "#controllers/admin/analytics.controller.js";
import { getCustomerDirectory } from "#controllers/admin/customer.controller.js";
import {
  getInventoryMatrix,
  getLowStockAlerts,
  updateStockOverride,
} from "#controllers/admin/inventory.controller.js";
import {
  getAllOrders,
  updateFulfillmentStatus,
  assignCourierTracking,
} from "#controllers/admin/orderFulfillment.controller.js";
import { UpdateStockOverrideSchema } from "#validations/product.validation.js";

const router = Router();

// Strict RBAC gate on all admin routes
router.use(authMiddleware, adminMiddleware);

// Analytics & Customers (Server-Side Paginated)
router.get("/analytics", getDashboardAnalytics);
router.get("/customers", getCustomerDirectory);

// Inventory Control (Server-Side Paginated)
router.get("/inventory", getInventoryMatrix);
router.get("/inventory/low-stock", getLowStockAlerts);
router.patch(
  "/inventory/:variantId/stock",
  validate(UpdateStockOverrideSchema),
  updateStockOverride,
);

// Order Fulfillment (Server-Side Paginated Pipeline)
router.get("/orders", getAllOrders);
router.patch("/orders/:orderId/status", updateFulfillmentStatus);
router.patch("/orders/:orderId/courier", assignCourierTracking);

export default router;
