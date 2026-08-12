import { Router } from "express";

import { supplierController } from "./supplier.controller.js";
import { supplierLedgerController } from "./supplier-ledger.controller.js";

const router = Router();

router.post(
  "/",
  supplierController.create.bind(supplierController)
);

router.get(
  "/",
  supplierController.findAll.bind(supplierController)
);

// Supplier Ledger routes MUST come before /:id
router.get(
  "/:id/ledger",
  supplierLedgerController.getLedger.bind(
    supplierLedgerController
  )
);

router.post(
  "/:id/ledger/payment",
  supplierLedgerController.createPayment.bind(
    supplierLedgerController
  )
);

router.get(
  "/:id",
  supplierController.findById.bind(supplierController)
);

router.put(
  "/:id",
  supplierController.update.bind(supplierController)
);

router.delete(
  "/:id",
  supplierController.delete.bind(supplierController)
);

export default router;