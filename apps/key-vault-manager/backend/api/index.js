// apps/key-vault-manager/backend/api/index.js
import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";
import { initEmailService } from "../src/services/emailService.js";

let isInitialized = false;

export default async function handler(req, res) {
  if (!isInitialized) {
    await Promise.all([connectDB(), initEmailService()]);
    isInitialized = true;
  }
  return app(req, res);
}
