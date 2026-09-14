import fs from "fs";
import path from "path";
import os from "os";
import sharp from "sharp";
import cloudinary from "#config/cloudinary.js";
import env from "#config/env.js";
import { logger } from "#config/logger.js";

// Determine safe storage directory (uses /tmp on serverless / Linux, local /uploads in dev)
const getSafeUploadsDir = () => {
  if (env.NODE_ENV === "production") {
    return os.tmpdir();
  }
  return path.resolve(process.cwd(), "uploads");
};

/**
 * Optimizes an image buffer: auto-rotates EXIF orientation, resizes, and converts to WebP.
 */
export const processImageToWebP = async (
  buffer,
  width = 1200,
  height = 1200,
) => {
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
 * Uploads to Cloudinary if configured; otherwise safely saves locally or returns Data URI.
 */
export const uploadImage = async (
  fileBuffer,
  folder = "nexus-commerce/products",
) => {
  const webpBuffer = await processImageToWebP(fileBuffer);

  // 1. Cloudinary Storage (Recommended for Production)
  if (
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
  ) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          format: "webp",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            logger.error({
              msg: "Cloudinary upload stream exception",
              error: error.message,
            });
            return reject(new Error("Media storage upload failed."));
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

  // 2. Production Serverless Fallback (Base64 Data URI)
  if (env.NODE_ENV === "production") {
    const base64 = webpBuffer.toString("base64");
    return {
      url: `data:image/webp;base64,${base64}`,
      publicId: `local_upload_${Date.now()}`,
    };
  }

  // 3. Local Development Disk Storage
  try {
    const uploadsDir = getSafeUploadsDir();
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.webp`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.promises.writeFile(filePath, webpBuffer);
    logger.debug({ msg: "Saved image to local storage", fileName });

    const baseUrl = env.CLIENT_URL ? "http://localhost:4000" : "";
    return {
      url: `${baseUrl}/uploads/${fileName}`,
      publicId: fileName,
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
