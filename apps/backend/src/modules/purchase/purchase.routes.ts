import { Router } from "express";

import { purchaseController } from "./purchase.controller.js";

const router = Router();

router.post("/", purchaseController.create.bind(purchaseController));

export default router;
