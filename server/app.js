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
import productLinkRoutes from "./routes/product-link-routes.js";
import userRoutes from "./routes/user-routes.js";
import checkoutRoutes from "./routes/checkout-routes.js";
import { authenticateUser } from "./middleware/auth.js";
import { dbConnectionMiddleware } from "./config/db.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
  "http://localhost:8080",
  "https://www.sajilomarts.tech",
  "https://sajilomarts.tech",
  process.env.FRONTEND_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()) : [])
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".pages.dev") ||
      origin.includes("pages.dev") ||
      origin.endsWith(".koyeb.app") ||
      origin.includes("koyeb.app") ||
      origin.endsWith(".vercel.app") ||
      origin.includes("vercel.app") ||
      origin.includes("sajilomarts") ||
      process.env.NODE_ENV !== "production"
    ) {
      callback(null, true);
    } else {
      callback(null, true); // Allow configured production origins
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Session-Token", "Accept"],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Security and Cross-Origin Opener Policy middleware
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static("uploads"));

// Built-in Cookie Parser for reliable auth cookie reading across cross-origin/proxies
app.use((req, res, next) => {
  if (req.headers.cookie && !req.cookies) {
    req.cookies = {};
    req.headers.cookie.split(";").forEach((cookieStr) => {
      const parts = cookieStr.split("=");
      if (parts.length >= 2) {
        req.cookies[parts[0].trim()] = decodeURIComponent(parts.slice(1).join("=").trim());
      }
    });
  } else if (!req.cookies) {
    req.cookies = {};
  }
  next();
});

// Health check endpoint (allowed even if DB is still connecting)
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Ensure database connection before running authenticated or database-backed routes
app.use(dbConnectionMiddleware);
app.use(authenticateUser);

// API Routers
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", checkoutRoutes);
app.use("/api/india-order", indiaOrderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/marketplace", productRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/request-product", requestRoutes);
app.use("/api/product-requests", requestRoutes);
app.use("/api/verify-product-link", productLinkRoutes);

// Fallback 404 handler for unmatched routes (always returns JSON, never HTML)
app.use((req, res) => {
  res.status(404).json({
    error: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Express Server Error]:", err?.message || err);
  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === "production";
  const message = (isProd && status === 500)
    ? "An unexpected error occurred. Please try again later."
    : (err.message || "Internal Server Error");

  res.status(status).json({
    error: message
  });
});

export default app;
