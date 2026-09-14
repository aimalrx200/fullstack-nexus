import { v2 as cloudinary } from "cloudinary";
import env from "./env.js";
import { logger } from "./logger.js";

const isConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME &&
  env.CLOUDINARY_API_KEY &&
  env.CLOUDINARY_API_SECRET,
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  logger.info({ msg: "🖼️ Cloudinary CDN media storage initialized" });
} else {
  logger.debug({
    msg: "Cloudinary credentials not set — running local image buffer optimization",
  });
}

export const isCloudinaryActive = () => isConfigured;

export default cloudinary;
