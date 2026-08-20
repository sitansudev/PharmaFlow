import { dashboardService } from "./dashboard.service.js";
export class DashboardController {
    async getStats(_req, res, next) {
        try {
            const stats = await dashboardService.getStats();
            res.json({
                success: true,
                message: "Dashboard fetched successfully",
                data: stats,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export const dashboardController = new DashboardController();
//# sourceMappingURL=dashboard.controller.js.map