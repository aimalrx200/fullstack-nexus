// apps/nexus-commerce/backend/src/controllers/products/media.controller.js

import fs from "fs";
import path from "path";
import cloudinary, { isCloudinaryActive } from "#config/cloudinary.js";
import env from "#config/env.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { logger } from "#config/logger.js";

/**
 * Generates cryptographic signature for browser-to-Cloudinary direct video uploads
 * GET /api/v1/media/upload-signature
 */
export const getUploadSignature = asyncHandler(async (req, res) => {
  const folder = req.query.folder || "nexus-commerce/products/videos";
  const timestamp = Math.round(new Date().getTime() / 1000);

  if (!isCloudinaryActive()) {
    return res.status(200).json({
      success: true,
      provider: "local",
      message: "Local development storage active.",
    });
  }

  const paramsToSign = {
    folder,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    env.CLOUDINARY_API_SECRET,
  );

  return res.status(200).json({
    success: true,
    provider: "cloudinary",
    signature,
    timestamp,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    folder,
  });
});

/**
 * Handles local video upload in development mode
 * POST /api/v1/media/upload-video
 */
export const uploadLocalVideo = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No video file provided in payload.",
    });
  }

  const subfolder = "products/videos";
  const targetDir = path.resolve(process.cwd(), "uploads", subfolder);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const ext = path.extname(req.file.originalname) || ".mp4";
  const fileName = `vid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
  const filePath = path.join(targetDir, fileName);

  await fs.promises.writeFile(filePath, req.file.buffer);

  const port = env.PORT || 4000;
  const url = `http://localhost:${port}/uploads/${subfolder}/${fileName}`;

  logger.info({ msg: "🎥 Local video saved", fileName });

  return res.status(200).json({
    success: true,
    video: {
      url,
      publicId: `${subfolder}/${fileName}`,
      thumbnailUrl: null,
    },
  });
});
