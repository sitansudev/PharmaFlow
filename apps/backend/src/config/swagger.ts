import swaggerUi from "swagger-ui-express";
import type { Express } from "express";

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "PharmaFlow API",
    version: "1.0.0",
    description: "Pharmacy Management System API",
  },
  servers: [
    {
      url: "http://localhost:5000/api/v1",
    },
  ],
  paths: {},
};

export function setupSwagger(app: Express) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}