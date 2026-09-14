import { asyncHandler } from "#utils/asyncHandler.js";

export const validate = (zSchema) =>
  asyncHandler(async (req, res, next) => {
    const hasTopLevelKeys =
      zSchema.shape &&
      ("body" in zSchema.shape ||
        "query" in zSchema.shape ||
        "params" in zSchema.shape);

    // Defensive short-circuit against invalid body structures
    if (
      hasTopLevelKeys &&
      zSchema.shape.body &&
      (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
    ) {
      return res.status(400).json({
        success: false,
        message: "Malformed request body structure.",
      });
    }

    const dataToValidate = hasTopLevelKeys
      ? { body: req.body, query: req.query, params: req.params }
      : req.body;

    const parsedData = await zSchema.parseAsync(dataToValidate);

    if (hasTopLevelKeys) {
      if (zSchema.shape.body) req.body = { ...parsedData.body };
      if (zSchema.shape.query) {
        for (const key in req.query) delete req.query[key];
        Object.assign(req.query, parsedData.query);
      }
      if (zSchema.shape.params) req.params = { ...parsedData.params };
    } else {
      req.body = { ...parsedData };
    }

    next();
  });
