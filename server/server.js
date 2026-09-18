import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables — priority: .env.local > .env > root .env
dotenv.config({ path: path.resolve(__dirname, ".env.local") });
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import { seedAdmin } from "./services/auth-service.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  const server = app.listen(PORT, async () => {
    console.log(`🚀 SajiloMarts Express Backend successfully listening on port ${PORT}`);
    try {
      const conn = await connectDB();
      if (conn) {
        await seedAdmin();
      }
    } catch (err) {
      console.error("[Database Connection Warning]:", err?.message || err);
    }
  });

  return server;
}

startServer();
