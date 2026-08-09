import { Router } from "express";

import { customerController } from "./customer.controller.js";

const router = Router();

router.post("/", customerController.create.bind(customerController));

router.get("/", customerController.findAll.bind(customerController));

router.get("/:id", customerController.findById.bind(customerController));

router.put("/:id", customerController.update.bind(customerController));

router.delete("/:id", customerController.delete.bind(customerController));
router.post(
  "/:id/payment",
  customerController.recordPayment.bind(
    customerController
  )
);

router.get(
  "/:id",
  customerController.findById.bind(
    customerController
  )
);
export default router;