// /apps/key-vault-manager/backend/src/config/logger.json

import pino from "pino";
import dotenv from "dotenv";

dotenv.config();

const isDevelopment =
  process.env.NODE_ENV === "development" || !process.env.NODE_ENV;

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),

  // Defensive Redaction Matrix: Catches both nested req mappings and raw root object leaks
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "headers.authorization",
      "headers.cookie",
      "body.password",
      "body.token",
      "password",
      "token",
    ],
    censor: "[REDACTED]",
  },

  // Infrastructure-aware transports
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "SYS:standard",
        },
      }
    : undefined, // Defaults to high-concurrency stdout strings for cloud collectors
});
