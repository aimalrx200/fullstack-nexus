import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";
import { initEmailService } from "../src/services/emailService.js";

export default async function handler(req, res) {
  try {
    // Parallel resolution on serverless entry
    await Promise.all([connectDB(), initEmailService()]);
  } catch (err) {
    console.error("Commerce Serverless initialization error:", err);
  }
  return app(req, res);
}
