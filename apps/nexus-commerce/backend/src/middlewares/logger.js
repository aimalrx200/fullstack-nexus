import crypto from "crypto";
import { logger } from "#config/logger.js";

export const requestLogger = (req, res, next) => {
  const startTime = process.hrtime();
  req.id = req.headers["x-request-id"] || crypto.randomUUID();

  // Redact sensitive query parameters from log
  const rawUrl = req.originalUrl || req.url;
  let sanitizedUrl = rawUrl;

  if (rawUrl.includes("?")) {
    const [path, queryString] = rawUrl.split("?");
    const params = new URLSearchParams(queryString);
    const SENSITIVE_KEYS = ["token", "password", "code", "secret", "mpin"];
    let modified = false;

    for (const key of SENSITIVE_KEYS) {
      if (params.has(key)) {
        params.set(key, "[REDACTED]");
        modified = true;
      }
    }
    sanitizedUrl = modified ? `${path}?${params.toString()}` : rawUrl;
  }

  const clientSentTime = req.headers["x-request-timestamp"];
  const networkTransitMs = clientSentTime
    ? Date.now() - parseInt(clientSentTime, 10)
    : 0;

  logger.info({
    msg: "📥 Inbound Commerce Request",
    requestId: req.id,
    method: req.method,
    url: sanitizedUrl,
    ip: req.ip,
    tabInstance: req.headers["x-client-instance-id"] || "N/A",
    transitLatency: `${networkTransitMs}ms`,
  });

  res.on("finish", () => {
    const diff = process.hrtime(startTime);
    const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

    const logPayload = {
      msg: "📤 Request Completed",
      requestId: req.id,
      method: req.method,
      url: sanitizedUrl,
      statusCode: res.statusCode,
      duration: `${durationMs}ms`,
    };

    if (res.statusCode >= 500) {
      logger.error(logPayload);
    } else if (res.statusCode >= 400) {
      logger.warn(logPayload);
    } else {
      logger.info(logPayload);
    }
  });

  next();
};
