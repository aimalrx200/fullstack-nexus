// apps/nexus-ats/backend/api/index.js

import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";
import { seedDatabase } from "../src/services/seedService.js";

export default async function handler(req, res) {
  await connectDB();
  await seedDatabase();
  return app(req, res);
}
