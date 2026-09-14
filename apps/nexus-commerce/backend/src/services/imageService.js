import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import cloudinary from "#config/cloudinary.js";
import env from "#config/env.js";
import { logger } from "#config/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");

// Ensure local uploads directory exists on startup
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

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
 * Uploads to Cloudinary if configured; otherwise writes to local /uploads directory.
 */
export const uploadImage = async (
  fileBuffer,
  folder = "nexus-commerce/products",
) => {
  const webpBuffer = await processImageToWebP(fileBuffer);

  // 1. Cloudinary Storage (if keys provided)
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

  // 2. Local Disk Storage Fallback
  const fileName = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.webp`;
  const filePath = path.join(UPLOADS_DIR, fileName);

  await fs.promises.writeFile(filePath, webpBuffer);

  logger.debug({ msg: "Saved image to local storage", fileName });

  // Public URL served by Express static middleware
  const baseUrl = env.CLIENT_URL ? "http://localhost:4000" : "";
  return {
    url: `${baseUrl}/uploads/${fileName}`,
    publicId: fileName,
  };
};
