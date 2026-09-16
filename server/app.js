import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth-routes.js";
import indiaOrderRoutes from "./routes/india-order-routes.js";
import adminRoutes from "./routes/admin-routes.js";
import productRoutes from "./routes/product-routes.js";
import paymentRoutes from "./routes/payment-routes.js";
import supportRoutes from "./routes/support-routes.js";
import requestRoutes from "./routes/request-routes.js";
import aiRoutes from "./routes/ai-routes.js";
import userRoutes from "./routes/user-routes.js";
import { authenticateUser } from "./middleware/auth.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://www.sajilomarts.tech",
  "https://sajilomarts.tech"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        callback(null, true);
      } else {
        callback(null, true); // Allow production origins seamlessly
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Session-Token", "Accept"]
  })
);

// Security and Cross-Origin Opener Policy middleware
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(authenticateUser);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API Routers
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/india-order", indiaOrderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/marketplace", productRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/request-product", requestRoutes);
app.use("/api/product-requests", requestRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/verify-product-link", aiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Express Server Error]:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error"
  });
});

export default app;
