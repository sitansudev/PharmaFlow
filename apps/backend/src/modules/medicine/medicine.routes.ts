import { Router } from "express";

import { medicineController } from "./medicine.controller.js";

const router = Router();

router.post(
  "/",
  medicineController.create.bind(
    medicineController
  )
);

router.post(
  "/quick",
  medicineController.quickCreate.bind(
    medicineController
  )
);

router.get(
  "/",
  medicineController.findAll.bind(
    medicineController
  )
);

router.get(
  "/group/:id",
  medicineController.findGroupedById.bind(
    medicineController
  )
);

router.get(
  "/:id",
  medicineController.findById.bind(
    medicineController
  )
);

router.put(
  "/:id",
  medicineController.update.bind(
    medicineController
  )
);

router.delete(
  "/:id",
  medicineController.delete.bind(
    medicineController
  )
);
export default router;