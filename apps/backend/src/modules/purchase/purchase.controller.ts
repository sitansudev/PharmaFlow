import { Request, Response } from "express";

import { purchaseService } from "./purchase.service.js";
import { createPurchaseSchema } from "./purchase.validation.js";

export class PurchaseController {
  async create(req: Request, res: Response): Promise<Response> {
    const data = createPurchaseSchema.parse(req.body);

    const purchase = await purchaseService.create(data);

    return res.status(201).json({
      success: true,
      message: "Purchase created successfully",
      data: purchase,
    });
  }

  async getById(req: Request, res: Response): Promise<Response> {
    const purchase = await purchaseService.getById(String(req.params.id));

    return res.status(200).json({
      success: true,
      data: purchase,
    });
  }

  async getAll(req: Request, res: Response): Promise<Response> {
    const purchases = await purchaseService.getAll();

    return res.status(200).json({
      success: true,
      count: purchases.length,
      data: purchases,
    });
  }
}

export const purchaseController = new PurchaseController();