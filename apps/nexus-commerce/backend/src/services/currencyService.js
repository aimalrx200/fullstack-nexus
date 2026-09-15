import { cacheStore } from "#config/redis.js";
import { logger } from "#config/logger.js";

const FX_CACHE_KEY = "fx:rates:USD";
const FX_CACHE_TTL_SECONDS = 12 * 60 * 60; // 12 Hours (43,200 seconds)
export const DEFAULT_USD_TO_PKR_RATE = 280.0;

/**
 * Fetches real-time USD/PKR exchange rates with Redis caching & resilient offline fallback.
 */
export const getLiveExchangeRates = async () => {
  // 1. Check Distributed Redis Cache
  try {
    const cachedRates = await cacheStore.get(FX_CACHE_KEY);
    if (cachedRates) {
      const parsed = JSON.parse(cachedRates);
      return {
        ...parsed,
        source: "cache",
      };
    }
  } catch (err) {
    logger.warn({ msg: "Redis FX cache lookup error", error: err.message });
  }

  // 2. Fetch from Open Exchange Rates API with 3.5-second timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const pkrRate = data.rates?.PKR
        ? Number(data.rates.PKR.toFixed(2))
        : DEFAULT_USD_TO_PKR_RATE;

      const ratePayload = {
        base: "USD",
        rates: {
          USD: 1,
          PKR: pkrRate,
        },
        lastUpdated: data.time_last_update_utc || new Date().toISOString(),
      };

      // Cache rates in Redis for 12 hours
      await cacheStore.setex(
        FX_CACHE_KEY,
        FX_CACHE_TTL_SECONDS,
        JSON.stringify(ratePayload),
      );

      logger.info({
        msg: "💱 Updated live FX exchange rates",
        USD_PKR: pkrRate,
      });

      return {
        ...ratePayload,
        source: "live_api",
      };
    }
  } catch (err) {
    clearTimeout(timeoutId);
    logger.warn({
      msg: "Live exchange rate fetch failed; using baseline fallback",
      error: err.message,
    });
  }

  // 3. Fallback rate if network / external API is unavailable
  return {
    base: "USD",
    rates: {
      USD: 1,
      PKR: DEFAULT_USD_TO_PKR_RATE,
    },
    lastUpdated: new Date().toISOString(),
    source: "static_fallback",
  };
};

/**
 * Retrieves current active USD to PKR exchange multiplier.
 */
export const getActiveUSDtoPKRRate = async () => {
  const data = await getLiveExchangeRates();
  return data.rates.PKR || DEFAULT_USD_TO_PKR_RATE;
};
