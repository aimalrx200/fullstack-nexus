// apps/key-vault-manager/backend/api/index.js
import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";
import { initEmailService } from "../src/services/emailService.js";

export default async function handler(req, res) {
  try {
    await connectDB();
    await initEmailService();
  } catch (err) {
    console.error("Serverless bootstrap initialization error:", err);
  }
  return app(req, res);
}
