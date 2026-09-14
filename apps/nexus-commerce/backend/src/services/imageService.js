import sharp from "sharp";
import cloudinary from "#config/cloudinary.js";
import env from "#config/env.js";
import { logger } from "#config/logger.js";

/**
 * Optimizes an image buffer: auto-rotates EXIF orientation, resizes, and converts to WebP.
 */
export const processImageToWebP = async (
  buffer,
  width = 1200,
  height = 1200,
) => {
  return sharp(buffer)
    .rotate() // 👈 Automatically fixes upside-down/sideways smartphone camera uploads
    .resize(width, height, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: 82,
      effort: 4, // Optimal CPU-to-compression ratio
    })
    .toBuffer();
};

/**
 * Streams optimized WebP image buffer to Cloudinary with fallback.
 */
export const uploadImage = async (
  fileBuffer,
  folder = "nexus-commerce/products",
) => {
  const webpBuffer = await processImageToWebP(fileBuffer);

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

  // Developer / Local Sandbox: Return optimized Data URI
  const base64 = webpBuffer.toString("base64");
  return {
    url: `data:image/webp;base64,${base64}`,
    publicId: `local_upload_${Date.now()}`,
  };
};
