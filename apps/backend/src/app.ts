import express from "express";
import cors from "cors";
import helmet from "helmet";
import { swaggerUi, swaggerSpec } from "./config/swagger.js";
import { errorHandler } from "./shared/errors/error-handler.js";

import authRoutes from "./modules/auth/auth.routes.js";
import medicineRoutes from "./modules/medicine/medicine.routes.js";
import categoryRoutes from "./modules/category/category.routes.js";
import supplierRoutes from "./modules/supplier/supplier.routes.js";
import purchaseRoutes from "./modules/purchase/purchase.routes.js";
import customerRoutes from "./modules/customer/customer.routes.js";
import saleRoutes from "./modules/sale/sale.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import { env } from "./config/env.js";
import {
  authenticate,
  type AuthRequest,
} from "./shared/middleware/auth.middleware.js";
import { authorize } from "./shared/middleware/authorize.middleware.js";

const app = express();

// ======================================
// Global Middlewares
// ======================================
app.use(helmet());

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

// ======================================
// Health Check
// ======================================

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "PharmaFlow Backend Running 🚀",
  });
});

// ======================================
// Swagger Documentation
// ======================================

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ======================================
// API Routes
// ======================================

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/medicines", medicineRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/suppliers", supplierRoutes);
app.use("/api/v1/purchases", purchaseRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/sales", saleRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// ======================================
// Protected Route Example
// ======================================

app.get(
  "/api/v1/profile",
  authenticate,
  authorize("ADMIN"),
  (req: AuthRequest, res) => {
    res.status(200).json({
      success: true,
      message: "Authenticated successfully",
      user: req.user,
    });
  }
);

// ======================================
// 404 Handler
// ======================================

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ======================================
// Global Error Handler (Always Last)
// ======================================

app.use(errorHandler);

export default app;