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
  simulateCourierDelivery,
} from "#controllers/admin/orderFulfillment.controller.js";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "#controllers/admin/coupon.controller.js"; // 👈 Import coupon controllers
import { UpdateStockOverrideSchema } from "#validations/product.validation.js";
import {
  CreateCouponSchema,
  UpdateCouponSchema,
} from "#validations/coupon.validation.js"; // 👈 Import coupon validations

const router = Router();

// Strict RBAC gate on all admin routes
router.use(authMiddleware, adminMiddleware);

// Analytics & Customers
router.get("/analytics", getDashboardAnalytics);
router.get("/customers", getCustomerDirectory);

// Inventory Control
router.get("/inventory", getInventoryMatrix);
router.get("/inventory/low-stock", getLowStockAlerts);
router.patch(
  "/inventory/:variantId/stock",
  validate(UpdateStockOverrideSchema),
  updateStockOverride,
);

// Order Fulfillment & Live Simulator
router.get("/orders", getAllOrders);
router.patch("/orders/:orderId/status", updateFulfillmentStatus);
router.patch("/orders/:orderId/courier", assignCourierTracking);
router.post("/orders/:orderId/simulate-delivery", simulateCourierDelivery);

// Promotional Coupon Management
router.get("/coupons", getCoupons);
router.post("/coupons", validate(CreateCouponSchema), createCoupon);
router.patch("/coupons/:couponId", validate(UpdateCouponSchema), updateCoupon);
router.delete("/coupons/:couponId", deleteCoupon);

export default router;
