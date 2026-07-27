import { Router } from "express";

import { categoryController } from "./category.controller.js";

const router = Router();

router.post("/", categoryController.create.bind(categoryController));
router.get("/", categoryController.findAll.bind(categoryController));
router.get("/:id", categoryController.findById.bind(categoryController));
router.put("/:id", categoryController.update.bind(categoryController));
router.delete("/:id", categoryController.delete.bind(categoryController));

export default router;