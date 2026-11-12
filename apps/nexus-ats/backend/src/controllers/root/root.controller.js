import { env } from "#config/env.js";

export const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    service: "Nexus ATS Core API",
    status: "OPERATIONAL",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    uptime: `${Math.floor(process.uptime())}s`,
  });
};
