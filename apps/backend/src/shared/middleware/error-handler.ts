import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: err instanceof Error ? err.message : "Internal Server Error",
  });
}