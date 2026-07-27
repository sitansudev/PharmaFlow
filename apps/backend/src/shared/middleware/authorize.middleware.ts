import type { NextFunction, Response } from "express";
import type { Role } from "@prisma/client";

import type { AuthRequest } from "./auth.middleware.js";

export function authorize(...roles: Role[]) {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role as Role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    next();
  };
}