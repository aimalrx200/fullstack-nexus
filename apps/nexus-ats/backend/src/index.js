// apps/nexus-ats/backend/src/index.js

import { app } from "./app.js";
import { env } from "#config/env.js";
import { connectDB } from "#config/db.js";
import { seedDatabase } from "#services/seedService.js";
import { logger } from "#config/logger.js";

const startServer = async () => {
  await connectDB();
  await seedDatabase();

  const server = app.listen(env.PORT, () => {
    logger.info(
      `🚀 Nexus ATS Backend running at: http://localhost:${env.PORT}`,
    );
    logger.info(
      `📡 Healthcheck available at: http://localhost:${env.PORT}/api/v1/health`,
    );
  });

  const gracefulShutdown = async (signal) => {
    logger.warn(
      `Received ${signal}. Shutting down Nexus ATS server gracefully...`,
    );
    server.close(() => {
      logger.info("HTTP server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
};

startServer().catch((err) => {
  logger.error({ err: err.message }, "Server failed to bootstrap");
  process.exit(1);
});
