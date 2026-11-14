// apps/nexus-ats/backend/src/services/cloudinaryService.js

import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { cloudinary, isCloudinaryConfigured } from "#config/cloudinary.js";
import { env } from "#config/env.js";
import { logger } from "#config/logger.js";

const DEFAULT_SAMPLE_PDF =
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

/**
 * Uploads candidate CV buffer with multi-tiered fallback:
 * Cloudinary (nexus-ats/resumes) -> Local Disk (uploads/resumes) -> Sample PDF
 *
 * @param {Express.Multer.File} file - Multer memory storage file object
 * @param {string} candidateName - Candidate name used for clean public ID naming
 * @returns {Promise<string>} Permanent HTTPS or Local URL to the document
 */
export const uploadCandidateCV = async (file, candidateName = "applicant") => {
  if (!file || !file.buffer) {
    logger.warn("No file buffer provided. Returning default sample PDF URL.");
    return DEFAULT_SAMPLE_PDF;
  }

  const cleanName = candidateName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .slice(0, 30);
  const timestamp = Date.now();
  const fileExt = path.extname(file.originalname) || ".pdf";
  const publicFileName = `cv_${cleanName}_${timestamp}`;

  // 1. Production Mode: Upload directly to isolated Cloudinary folder
  if (isCloudinaryConfigured()) {
    try {
      return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "nexus-ats/resumes",
            public_id: publicFileName,
            resource_type: "auto",
            tags: ["ats-candidate-cv"],
            format: "pdf",
          },
          (error, result) => {
            if (error) {
              logger.error(
                { err: error.message },
                "Cloudinary CV upload stream failed",
              );
              return reject(error);
            }
            logger.info(
              `📄 CV uploaded to Cloudinary: nexus-ats/resumes/${publicFileName}`,
            );
            resolve(result.secure_url);
          },
        );

        // Native Node stream: No external package needed
        Readable.from(file.buffer).pipe(uploadStream);
      });
    } catch (err) {
      logger.error(
        { err: err.message },
        "Cloudinary upload failed. Falling back to secondary storage.",
      );
    }
  }

  // 2. Development Mode: Store in local distinct folder (uploads/resumes/)
  if (env.NODE_ENV === "development") {
    try {
      const localUploadDir = path.join(process.cwd(), "uploads", "resumes");
      if (!fs.existsSync(localUploadDir)) {
        fs.mkdirSync(localUploadDir, { recursive: true });
      }

      const localFileName = `${publicFileName}${fileExt}`;
      const localFilePath = path.join(localUploadDir, localFileName);

      fs.writeFileSync(localFilePath, file.buffer);

      const localFileUrl = `http://localhost:${env.PORT}/uploads/resumes/${localFileName}`;
      logger.info(`💾 CV stored on local disk: ${localFileUrl}`);
      return localFileUrl;
    } catch (localErr) {
      logger.error(
        { err: localErr.message },
        "Local file storage write failed",
      );
    }
  }

  // 3. Fallback to prevent breaking the application intake pipeline
  logger.warn("All storage methods failed. Defaulting to sample PDF URL.");
  return DEFAULT_SAMPLE_PDF;
};
