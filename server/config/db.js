import mongoose from "mongoose";

let cachedPromise = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedPromise) {
    return cachedPromise;
  }

  const mongoURI =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.DATABASE_URL ||
    process.env.MONGODB_URL;

  if (!mongoURI) {
    console.error("[MongoDB] CRITICAL: No connection URI found. Set MONGODB_URI in environment variables.");
    return null;
  }

  cachedPromise = (async () => {
    try {
      mongoose.set("strictQuery", false);
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
        minPoolSize: 1
      });
      console.log(`[MongoDB Connected Successfully]: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      cachedPromise = null;
      console.error(`[MongoDB Connection Error]: ${error.message}`);
      console.error(
        "👉 IMPORTANT: If hosted on Render, ensure MongoDB Atlas Network Access whitelist contains '0.0.0.0/0' (Allow Access from Anywhere)."
      );
      return null;
    }
  })();

  return cachedPromise;
}

export async function dbConnectionMiddleware(req, res, next) {
  if (req.path === "/api/health") return next();

  if (mongoose.connection.readyState !== 1) {
    try {
      const conn = await connectDB();
      if (!conn || mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          error: "Database is currently connecting. If this persists, verify MongoDB Atlas Network Access allows 0.0.0.0/0."
        });
      }
    } catch (err) {
      return res.status(503).json({
        error: "Database connection unavailable: " + err.message
      });
    }
  }
  next();
}

// Global mongoose connection event listeners
mongoose.connection.on("disconnected", () => {
  console.warn("[MongoDB] Disconnected. Reconnecting...");
  cachedPromise = null;
});

mongoose.connection.on("error", (err) => {
  console.error("[MongoDB Error]:", err.message);
  cachedPromise = null;
});

export default connectDB;
