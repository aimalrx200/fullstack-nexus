import { Router } from "express";
import {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  archiveProduct,
} from "#controllers/products/product.controller.js";
import {
  createVariant,
  updateVariantStock,
} from "#controllers/products/variant.controller.js";
import { authMiddleware } from "#middlewares/authMiddleware.js";
import { adminMiddleware } from "#middlewares/adminMiddleware.js";
import { upload } from "#middlewares/upload.js";
import { validate } from "#middlewares/validate.js";
import {
  CreateProductSchema,
  UpdateProductSchema,
  CreateVariantSchema,
  UpdateStockOverrideSchema,
} from "#validations/product.validation.js";

const router = Router();

// =============================================================================
// 1. PUBLIC STOREFRONT PRODUCT DISCOVERY
// =============================================================================
router.get("/", getProducts);
router.get("/id/:productId", getProductById);
router.get("/:slug", getProductBySlug);

// =============================================================================
// 2. PROTECTED MERCHANT CATALOG MANAGEMENT
// =============================================================================
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.array("images", 5),
  validate(CreateProductSchema),
  createProduct,
);
router.patch(
  "/:productId",
  authMiddleware,
  adminMiddleware,
  validate(UpdateProductSchema),
  updateProduct,
);
router.delete("/:productId", authMiddleware, adminMiddleware, archiveProduct);

// SKU Variant Management
router.post(
  "/variants",
  authMiddleware,
  adminMiddleware,
  validate(CreateVariantSchema),
  createVariant,
);
router.patch(
  "/variants/:variantId/stock",
  authMiddleware,
  adminMiddleware,
  validate(UpdateStockOverrideSchema),
  updateVariantStock,
);

export default router;
