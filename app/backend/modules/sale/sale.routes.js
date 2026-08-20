import { Router } from "express";
import { saleController } from "./sale.controller.js";
import { validate } from "../../shared/middleware/validate.js";
import { createSaleSchema } from "./sale.validation.js";
const router = Router();
router.post("/", validate(createSaleSchema), saleController.create.bind(saleController));
router.get("/", saleController.getAll.bind(saleController));
router.get("/:id", saleController.getById.bind(saleController));
export default router;
//# sourceMappingURL=sale.routes.js.map