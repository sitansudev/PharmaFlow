import { Router } from "express";
import { dashboardController } from "./dashboard.controller.js";
import { authenticate } from "../../shared/middleware/auth.middleware.js";
import { authorize } from "../../shared/middleware/authorize.middleware.js";
const router = Router();
router.get("/", authenticate, authorize("ADMIN", "PHARMACIST"), dashboardController.getStats.bind(dashboardController));
export default router;
//# sourceMappingURL=dashboard.routes.js.map