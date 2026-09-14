import pino from "pino";
import dotenv from "dotenv";

dotenv.config();

const isDev = process.env.NODE_ENV === "development" || !process.env.NODE_ENV;

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "headers.authorization",
      "headers.cookie",
      "body.password",
      "body.mpin",
      "body.cvv",
      "body.cardNumber",
      "body.credentialPublicKey",
      "body.pp_SecureHash",
      "body.checksum",
      "password",
      "mpin",
      "token",
      "secret",
    ],
    censor: "[REDACTED]",
  },
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "SYS:standard",
        },
      }
    : undefined,
});
