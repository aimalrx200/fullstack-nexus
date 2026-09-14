import { cacheStore } from "#config/redis.js";
import { IDEMPOTENCY_TTL_SECONDS } from "#config/time.constants.js";

export const enforceIdempotency = async (req, res, next) => {
  const idempotencyKey =
    req.headers["x-idempotency-key"] || req.body?.idempotencyKey;

  if (!idempotencyKey) {
    return next();
  }

  const cacheKey = `idempotency:${idempotencyKey}`;
  const existing = await cacheStore.get(cacheKey);

  if (existing) {
    if (existing === "PROCESSING") {
      return res.status(409).json({
        success: false,
        message:
          "An identical transaction is currently in flight. Please wait.",
      });
    }

    try {
      const cached = JSON.parse(existing);
      return res.status(cached.status || 200).json(cached.body);
    } catch {
      // If parsing fails, proceed
    }
  }

  // Lock key in PROCESSING state
  await cacheStore.setex(cacheKey, IDEMPOTENCY_TTL_SECONDS, "PROCESSING");

  // Intercept res.json to cache response
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cacheStore
        .setex(
          cacheKey,
          IDEMPOTENCY_TTL_SECONDS,
          JSON.stringify({ status: res.statusCode, body }),
        )
        .catch(() => {});
    } else {
      cacheStore.del(cacheKey).catch(() => {});
    }
    return originalJson(body);
  };

  req.idempotencyKey = idempotencyKey;
  next();
};
