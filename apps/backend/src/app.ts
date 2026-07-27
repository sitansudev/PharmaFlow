import express from "express";
import cors from "cors";

import authRoutes from "./modules/auth/auth.routes.js";
import { errorHandler } from "./shared/middleware/error-handler.js";
import { authenticate } from "./shared/middleware/auth.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "PharmaFlow Backend Running 🚀",
  });
});

app.use("/api/v1/auth", authRoutes);

// Temporary protected route for testing
app.get("/api/v1/profile", authenticate, (_req, res) => {
  res.json({
    success: true,
    message: "Authenticated successfully",
  });
});

app.use(errorHandler);

export default app;