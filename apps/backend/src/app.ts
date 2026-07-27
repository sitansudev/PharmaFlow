import express from "express";
import cors from "cors";

import authRoutes from "./modules/auth/auth.routes.js";

import { authenticate, type AuthRequest } from "./shared/middleware/auth.middleware.js";
import { authorize } from "./shared/middleware/authorize.middleware.js";
import { errorHandler } from "./shared/middleware/error-handler.js";

const app = express();

// ==============================
// Global Middlewares
// ==============================

app.use(cors());
app.use(express.json());

// ==============================
// Health Check
// ==============================

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "PharmaFlow Backend Running 🚀",
  });
});

// ==============================
// API Routes
// ==============================

app.use("/api/v1/auth", authRoutes);

// ==============================
// Protected Route
// ==============================

app.get(
  "/api/v1/profile",
  authenticate,
  authorize("ADMIN"),
  (req: AuthRequest, res) => {
    res.json({
      success: true,
      message: "Authenticated successfully",
      user: req.user,
    });
  }
);

// ==============================
// Global Error Handler
// ==============================

app.use(errorHandler);

export default app;