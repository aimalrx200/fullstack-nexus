// apps/nexus-commerce/backend/src/services/imageService.js

import fs from "fs";
import path from "path";
import os from "os";
import sharp from "sharp";
import cloudinary from "#config/cloudinary.js";
import env from "#config/env.js";
import { logger } from "#config/logger.js";

const ALLOWED_IMAGE_FORMATS = new Set(["jpeg", "png", "webp", "avif"]);

/**
 * Resolves the root uploads storage directory:
 * - Development: <project_root>/uploads
 * - Production / Serverless fallback: os.tmpdir()
 */
const getSafeUploadsDir = () => {
  if (env.NODE_ENV === "production") {
    return os.tmpdir();
  }
  return path.resolve(process.cwd(), "uploads");
};

/**
 * Inspects binary magic bytes to prevent MIME-spoofing attacks.
 */
export const validateImageMagicBytes = async (buffer) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("Invalid image buffer provided for analysis.");
  }

  try {
    const metadata = await sharp(buffer).metadata();
    if (!metadata.format || !ALLOWED_IMAGE_FORMATS.has(metadata.format)) {
      throw new Error(
        `Invalid file signature. Detected format: '${metadata.format || "unknown"}'. Only JPEG, PNG, WebP, and AVIF are allowed.`,
      );
    }
    return metadata;
  } catch (err) {
    logger.warn({
      msg: "Magic byte inspection failed: Rejected suspicious file payload",
      error: err.message,
    });
    throw new Error(
      "File content is corrupted or not a valid recognized image format.",
      { cause: err },
    );
  }
};

/**
 * Optimizes image buffer: validates magic bytes, auto-rotates EXIF, resizes, and converts to WebP.
 */
export const processImageToWebP = async (
  buffer,
  width = 1200,
  height = 1200,
) => {
  await validateImageMagicBytes(buffer);

  return sharp(buffer)
    .rotate()
    .resize(width, height, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: 82,
      effort: 4,
    })
    .toBuffer();
};

/**
 * Uploads an image with hierarchical folder routing:
 * - Local Dev: writes to `uploads/${subfolder}/`
 * - Cloudinary: writes to `nexus-commerce/${subfolder}`
 *
 * @param {Buffer} fileBuffer - Raw uploaded file buffer
 * @param {string} subfolder - Target relative path (e.g. "products/images", "support/chat")
 */
export const uploadImage = async (
  fileBuffer,
  subfolder = "products/images",
) => {
  const webpBuffer = await processImageToWebP(fileBuffer);
  const cleanSubfolder = subfolder.replace(/^\/+|\/+$/g, ""); // e.g. "products/images"

  // 1. Production Mode: Cloudinary CDN Storage
  if (
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
  ) {
    const cloudinaryFolder = `nexus-commerce/${cleanSubfolder}`;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: cloudinaryFolder,
          format: "webp",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            logger.error({
              msg: "Cloudinary upload stream exception",
              error: error.message,
            });
            return reject(
              new Error("Media storage upload failed.", { cause: error }),
            );
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );
      uploadStream.end(webpBuffer);
    });
  }

  // 2. Production Serverless Fallback (Base64 Data URI if Cloudinary credentials missing)
  if (env.NODE_ENV === "production") {
    const base64 = webpBuffer.toString("base64");
    return {
      url: `data:image/webp;base64,${base64}`,
      publicId: `local_upload_${Date.now()}`,
    };
  }

  // 3. Local Development Disk Storage with Scoped Subfolders
  try {
    const uploadsRoot = getSafeUploadsDir();
    const targetDir = path.join(uploadsRoot, cleanSubfolder);

    // Recursively create directory structure (e.g. uploads/products/images/)
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const fileName = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.webp`;
    const filePath = path.join(targetDir, fileName);

    await fs.promises.writeFile(filePath, webpBuffer);
    logger.debug({
      msg: "Saved image to local scoped directory",
      subfolder: cleanSubfolder,
      fileName,
    });

    const port = env.PORT || 4000;
    const baseUrl = `http://localhost:${port}`;
    return {
      url: `${baseUrl}/uploads/${cleanSubfolder}/${fileName}`,
      publicId: `${cleanSubfolder}/${fileName}`,
    };
  } catch (err) {
    logger.warn({
      msg: "Local disk write failed, falling back to Data URI",
      error: err.message,
    });
    const base64 = webpBuffer.toString("base64");
    return {
      url: `data:image/webp;base64,${base64}`,
      publicId: `local_upload_${Date.now()}`,
    };
  }
};
