// apps/nexus-commerce/backend/src/routes/admin.routes.js
import { Router } from "express";
import { authMiddleware } from "#middlewares/authMiddleware.js";
import {
  requireRoles,
  protectMasterRecord,
} from "#middlewares/rbacMiddleware.js";
import { validate } from "#middlewares/validate.js";
import { Coupon } from "#models/index.js";
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
} from "#controllers/admin/coupon.controller.js";
import { UpdateStockOverrideSchema } from "#validations/product.validation.js";
import {
  CreateCouponSchema,
  UpdateCouponSchema,
} from "#validations/coupon.validation.js";

const router = Router();
router.use(authMiddleware);

// 1. Customer Directory: Accessible by Support, Merchant Admin & Super Admin
router.get(
  "/customers",
  requireRoles("support_agent", "merchant_admin", "super_admin"),
  getCustomerDirectory,
);

// 2. Financial Analytics & GMV: Accessible ONLY by Merchant Admin & Super Admin
router.get(
  "/analytics",
  requireRoles("merchant_admin", "super_admin"),
  getDashboardAnalytics,
);

// 3. Inventory Controls: Restricted to Merchant Admin & Super Admin
router.get(
  "/inventory",
  requireRoles("merchant_admin", "super_admin"),
  getInventoryMatrix,
);
router.get(
  "/inventory/low-stock",
  requireRoles("merchant_admin", "super_admin"),
  getLowStockAlerts,
);
router.patch(
  "/inventory/:variantId/stock",
  requireRoles("merchant_admin", "super_admin"),
  validate(UpdateStockOverrideSchema),
  updateStockOverride,
);

// 4. Order Fulfillment Pipeline: Restricted to Merchant Admin & Super Admin
router.get(
  "/orders",
  requireRoles("merchant_admin", "super_admin"),
  getAllOrders,
);
router.patch(
  "/orders/:orderId/status",
  requireRoles("merchant_admin", "super_admin"),
  updateFulfillmentStatus,
);
router.patch(
  "/orders/:orderId/courier",
  requireRoles("merchant_admin", "super_admin"),
  assignCourierTracking,
);
router.post(
  "/orders/:orderId/simulate-delivery",
  requireRoles("merchant_admin", "super_admin"),
  simulateCourierDelivery,
);

// 5. Promotional Coupons: Restricted to Merchant Admin & Super Admin with Protected Record Shield
router.get(
  "/coupons",
  requireRoles("merchant_admin", "super_admin"),
  getCoupons,
);
router.post(
  "/coupons",
  requireRoles("merchant_admin", "super_admin"),
  validate(CreateCouponSchema),
  createCoupon,
);
router.patch(
  "/coupons/:couponId",
  requireRoles("merchant_admin", "super_admin"),
  protectMasterRecord(Coupon, "couponId"),
  validate(UpdateCouponSchema),
  updateCoupon,
);
router.delete(
  "/coupons/:couponId",
  requireRoles("merchant_admin", "super_admin"),
  protectMasterRecord(Coupon, "couponId"),
  deleteCoupon,
);

export default router;
