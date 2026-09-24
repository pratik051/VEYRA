import "./config/env.js";


import app from "./app.js";
import connectDB from "./config/db.js";
import { seedAdmin } from "./services/auth-service.js";

const PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = process.env.HOST || "0.0.0.0";

async function startServer() {
  try {
    const conn = await connectDB();
    if (conn) {
      await seedAdmin();
    }
  } catch (err) {
    console.error("[Database Initial Connection Warning]:", err?.message || err);
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 SajiloMarts Express Backend listening on http://${HOST}:${PORT} (PORT=${PORT})`);
  });

  const shutdown = (signal) => {
    console.log(`[Shutdown] Received ${signal}. Closing server gracefully...`);
    server.close(() => {
      console.log("[Shutdown] HTTP server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  return server;
}

startServer();
