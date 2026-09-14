import http from "http";
import app from "./app.js";
import env from "./config/env.js";
import { connectDB } from "./config/db.js";
import { initEmailService } from "./services/emailService.js";
import { initWebSocketServer } from "./websockets/wsServer.js";
import { startInventoryReconciliationWorker } from "./services/inventoryReconciler.js";
import { startJobQueueWorker } from "./services/jobQueue.js";
import { logger } from "./config/logger.js";

const server = http.createServer(app);

// Initialize WebSockets attached to the HTTP server
initWebSocketServer(server);

Promise.all([connectDB(), initEmailService()])
  .then(() => {
    // 1. Start the self-healing inventory reconciliation worker (every 5 mins)
    startInventoryReconciliationWorker(300000);

    // 2. Start the async background task queue worker (polls every 1.5s)
    startJobQueueWorker(1500);

    server.listen(env.PORT, () => {
      logger.info({
        msg: "🚀 Nexus Commerce Backend API, Workers & Socket Engine Live",
        port: env.PORT,
        environment: env.NODE_ENV,
      });
    });
  })
  .catch((err) => {
    logger.fatal({ msg: "Server bootstrap failed", error: err.message });
    process.exit(1);
  });
