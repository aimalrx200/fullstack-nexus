// server/middlewares/logger.js
import crypto from "crypto";
import { logger } from "#config/logger.js";

export const requestLogger = (req, res, next) => {
  const startTime = process.hrtime();

  // Pick up the frontend tracer identifier if present, or generate a fallback
  req.id =
    req.headers["x-request-id"] || crypto.randomUUID() || Date.now().toString();

  // Calculate strict network transit time (latency overhead)
  const clientSentTime = req.headers["x-request-timestamp"];
  const networkTransitMs = clientSentTime
    ? Date.now() - parseInt(clientSentTime, 10)
    : 0;

  const rawUrl = req.originalUrl || req.url;
  let sanitizedUrl = rawUrl;

  if (rawUrl.includes("?")) {
    const [path, queryString] = rawUrl.split("?");
    const params = new URLSearchParams(queryString);
    const sensitiveKeys = ["token", "password", "email", "secret", "code"];
    let modified = false;

    for (const key of sensitiveKeys) {
      if (params.has(key)) {
        params.set(key, "[REDACTED]");
        modified = true;
      }
    }
    sanitizedUrl = modified ? `${path}?${params.toString()}` : rawUrl;
  }

  // Enhanced entry telemetry log
  logger.info({
    msg: "📥 Incoming Requestbound Gate",
    requestId: req.id,
    method: req.method,
    url: sanitizedUrl,
    ip: req.ip,
    tabInstance: req.headers["x-client-instance-id"] || "N/A",
    networkLatency: `${networkTransitMs}ms`, // Shows exactly how long the packet was in transit
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
      durationMs: `${durationMs}ms`,
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
