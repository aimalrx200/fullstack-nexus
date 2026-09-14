import { logger } from "#config/logger.js";
import env from "#config/env.js";
import multer from "multer";

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || "An unexpected system exception occurred.";
  let errors = undefined;

  // 1. Zod Validation Errors
  if (err.name === "ZodError") {
    statusCode = 400;
    message = "Validation failed for submitted payload.";

    const formatted = {};
    for (const issue of err.issues || []) {
      let path = issue.path;
      if (path[0] === "body") path = path.slice(1);
      const key = path.join(".") || "_errors";

      if (!formatted[key]) formatted[key] = [];
      formatted[key].push(issue.message);
    }
    errors = formatted;
  }
  // 2. Multer File Upload Errors
  else if (err instanceof multer.MulterError) {
    statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File is too large. Maximum allowed file size is 5MB.";
    } else {
      message = `Upload Error: ${err.message}`;
    }
  }
  // 3. Mongoose Cast Error (Invalid ObjectId)
  else if (err.name === "CastError") {
    statusCode = 404;
    message = "The requested resource could not be found.";
  }
  // 4. Duplicate Unique Index Error
  else if (err.code === 11000) {
    statusCode = 409;
    message = "A record with matching unique details already exists.";
  }

  const logPayload = {
    msg:
      statusCode >= 500
        ? "💥 Serverless Pipeline Exception"
        : "⚠️ API Operational Notice",
    requestId: req.id || req.headers["x-request-id"] || "N/A",
    path: req.originalUrl || req.url,
    method: req.method,
    statusCode,
    clientMessage: message,
    error: {
      message: err.message,
      name: err.name,
      stack: err.stack,
    },
    ...(errors && { validationErrors: errors }),
  };

  if (statusCode >= 500) {
    logger.error(logPayload);
  } else {
    logger.warn(logPayload);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
