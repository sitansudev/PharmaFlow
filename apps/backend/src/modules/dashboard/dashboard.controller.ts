import { Request, Response, NextFunction } from "express";

import { dashboardService } from "./dashboard.service.js";

export class DashboardController {
  async getStats(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const stats = await dashboardService.getStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController =
  new DashboardController();