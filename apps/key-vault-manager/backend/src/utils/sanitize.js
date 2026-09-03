// server/utils/sanitize.js
import DOMPurify from "isomorphic-dompurify";

/**
 * High-performance HTML sanitation utility.
 * Eradicates XSS injection vectors without the heavy JSDOM browser overhead.
 */
export const sanitizeInput = (dirty) => {
  if (typeof dirty !== "string") return dirty;
  return DOMPurify.sanitize(dirty);
};
