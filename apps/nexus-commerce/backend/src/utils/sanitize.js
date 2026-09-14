import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes a single string against XSS injection vectors.
 */
export const sanitizeInput = (dirty) => {
  if (typeof dirty !== "string") return dirty;
  return DOMPurify.sanitize(dirty.trim());
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
