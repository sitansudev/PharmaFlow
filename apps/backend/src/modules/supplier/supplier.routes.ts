import { Router } from "express";

import { supplierController } from "./supplier.controller.js";

const router = Router();

router.post("/", supplierController.create.bind(supplierController));
router.get("/", supplierController.findAll.bind(supplierController));
router.get("/:id", supplierController.findById.bind(supplierController));
router.put("/:id", supplierController.update.bind(supplierController));
router.delete("/:id", supplierController.delete.bind(supplierController));

export default router;
