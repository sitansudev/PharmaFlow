import { Request, Response } from "express";

import { purchaseService } from "./purchase.service.js";
import { createPurchaseSchema } from "./purchase.validation.js";

export class PurchaseController {
  async create(req: Request, res: Response) {
    const data = createPurchaseSchema.parse(req.body);

    const purchase = await purchaseService.create(data);

    return res.status(201).json({
      success: true,
      message: "Purchase created successfully",
      data: purchase,
    });
  }
}

export const purchaseController = new PurchaseController();
