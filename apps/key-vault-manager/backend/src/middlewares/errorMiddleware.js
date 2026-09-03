// server/middlewares/errorMiddleware.js
import { logger } from "#config/logger.js";
import env from "#config/env.js";

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.status || err.statusCode || 500;
  let message = "Something went wrong on our end. Please try again later.";
  let errors = undefined;

  const isProduction = env.NODE_ENV === "production";

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
    message =
      "We couldn't process this request. Please review the details sent.";
  } else if (err.name === "ZodError") {
    statusCode = 400;
    message = "Please update the fields below to finish submitting.";

    const formattedErrors = {};
    // Extract issues to an isolated array frame to keep processing safe
    const issues = Array.isArray(err.issues) ? [...err.issues] : [];

    for (const issue of issues) {
      let path = issue.path;

      // 🚀 OPTIMIZATION: If the path begins with 'body', flatten it so frontend
      // can map directly to fields (e.g., errors.username instead of errors.body.username)
      if (path[0] === "body") {
        path = path.slice(1);
      }

      if (path.length === 0) {
        formattedErrors._errors = formattedErrors._errors || [];
        formattedErrors._errors.push(issue.message);
        continue;
      }

      let cursor = formattedErrors;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];

        if (cursor[key] !== undefined && Array.isArray(cursor[key])) {
          cursor[key] = { _errors: cursor[key] };
        } else {
          cursor[key] = cursor[key] || {};
        }
        cursor = cursor[key];
      }

      const leafKey = path[path.length - 1];
      if (cursor[leafKey] !== undefined && !Array.isArray(cursor[leafKey])) {
        cursor[leafKey]._errors = cursor[leafKey]._errors || [];
        cursor[leafKey]._errors.push(issue.message);
      } else {
        cursor[leafKey] = cursor[leafKey] || [];
        cursor[leafKey].push(issue.message);
      }
    }
    errors = formattedErrors;
  } else if (err.name === "CastError") {
    statusCode = 404;
    message = "The page or item you're looking for doesn't exist.";
  } else if (err.code === 11000) {
    statusCode = 409;

    message = "That information is already in use by another profile.";
  } else if (statusCode < 500) {
    message = err.message || "We encountered an issue processing your request.";
  }

  const logPayload = {
    msg:
      statusCode >= 500
        ? "💥 Unhandled Server Exception"
        : "⚠️ Operational Pipeline Exception",
    requestId: req.id || "N/A",
    path: req.originalUrl || req.url,
    method: req.method,
    statusCode,
    clientMessage: message,
    error: {
      message: err.message,
      name: err.name || "Error",
      code: err.code,
      stack: err.stack,
    },
    ...(errors && { validationErrors: errors }),
  };

  if (statusCode >= 500) {
    logger.error(logPayload);
  } else {
    logger.warn(logPayload);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(!isProduction && { stack: err.stack }),
  });
};
