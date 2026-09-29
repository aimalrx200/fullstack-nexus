// apps/nexus-commerce/backend/src/routes/media.routes.js

import { Router } from "express";
import { authMiddleware } from "#middlewares/authMiddleware.js";
import { adminMiddleware } from "#middlewares/adminMiddleware.js";
import { videoUpload } from "#middlewares/upload.js";
import {
  getUploadSignature,
  uploadLocalVideo,
} from "#controllers/products/media.controller.js";

const router = Router();

// Restricted to authenticated merchant administrators
router.use(authMiddleware, adminMiddleware);

router.get("/upload-signature", getUploadSignature);
router.post("/upload-video", videoUpload.single("video"), uploadLocalVideo);

export default router;
