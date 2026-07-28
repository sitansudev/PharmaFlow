import { Router } from "express";

import { saleController } from "./sale.controller.js";

const router = Router();

router.post(
  "/",
  saleController.create.bind(saleController)
);

export default router;