/**
 * Serverless-safe input sanitizer that strips dangerous HTML tags,
 * scripts, and malicious XSS vectors without relying on JSDOM.
 */
export const sanitizeInput = (dirty) => {
  if (typeof dirty !== "string") return dirty;

  return (
    dirty
      .trim()
      // Strip script and style tags along with their content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      // Strip all remaining HTML tags
      .replace(/<\/?[^>]+(>|$)/g, "")
      // Strip javascript: pseudo-protocols
      .replace(/javascript:/gi, "")
      // Neutralize inline event handlers
      .replace(/on\w+\s*=/gi, "")
  );
};

/**
 * Recursively sanitizes all string properties inside an object or array.
 */
export const sanitizeObject = (data) => {
  if (!data) return data;

  if (typeof data === "string") {
    return sanitizeInput(data);
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeObject(item));
  }

  if (typeof data === "object" && data.constructor === Object) {
    const clean = {};
    for (const key of Object.keys(data)) {
      clean[key] = sanitizeObject(data[key]);
    }
    return clean;
  }

  return data;
};
