// server/middlewares/validate.js
import { logger } from "#config/logger.js";
import { asyncHandler } from "#utils/asyncHandler.js";

/**
 * Express middleware to validate incoming requests against a Zod schema.
 * Leverages asyncHandler to pipe exceptions naturally to the centralized global error handler.
 */
export const validate = (zSchema) =>
  asyncHandler(async (req, res, next) => {
    const hasTopLevelKeys =
      zSchema.shape &&
      ("body" in zSchema.shape ||
        "query" in zSchema.shape ||
        "params" in zSchema.shape);

    // 1. Defensive Short-Circuit: Prevent unparsed non-JSON payloads from breaking the walker
    if (
      hasTopLevelKeys &&
      zSchema.shape.body &&
      (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
    ) {
      logger.warn({
        msg: "🛑 Request rejected: Malformed content type or empty body layout structure mismatch.",
        path: req.originalUrl,
        requestId: req.id || "N/A",
      });

      return res.status(400).json({
        success: false,
        message:
          "We couldn't process this request. Please review the details sent.",
      });
    }

    const dataToValidate = hasTopLevelKeys
      ? { body: req.body, query: req.query, params: req.params }
      : req.body;

    const parsedData = await zSchema.parseAsync(dataToValidate);

    // Reassign safe, validated data without overwriting the base object references
    if (hasTopLevelKeys) {
      // 1. Handle Body Reassignment safely
      if (zSchema.shape.body) {
        req.body = { ...parsedData.body };
      } else {
        req.body = {};
      }

      // 2. Handle Query Reassignment (Mutate the properties instead of overwriting the reference)
      if (zSchema.shape.query) {
        // Clear old unvalidated values from the existing reference frame
        for (const key in req.query) {
          delete req.query[key];
        }
        // Mix the validated properties back in
        Object.assign(req.query, parsedData.query);
      } else {
        // If the schema didn't care about query params, wipe the properties to avoid leaks
        for (const key in req.query) {
          delete req.query[key];
        }
      }

      // 3. Handle Params Reassignment cleanly
      if (zSchema.shape.params) {
        req.params = { ...parsedData.params };
      } else {
        req.params = {};
      }
    } else {
      req.body = { ...parsedData };
    }

    return next();
  });
