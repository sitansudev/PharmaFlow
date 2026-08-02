import { Router } from "express";

import { purchaseController } from "./purchase.controller.js";

const router = Router();

router.post(
  "/",
  purchaseController.create.bind(purchaseController)
);

router.get(
  "/",
  purchaseController.getAll.bind(purchaseController)
);

router.get(
  "/:id",
  purchaseController.getById.bind(purchaseController)
);

export default router;