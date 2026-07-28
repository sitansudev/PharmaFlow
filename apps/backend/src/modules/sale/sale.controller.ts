
import { Request, Response, NextFunction } from "express";

import { saleService } from "./sale.service.js";
import { createSaleSchema } from "./sale.validation.js";

export class SaleController {
  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = createSaleSchema.parse(req.body);

      const sale = await saleService.create(data);

      res.status(201).json({
        success: true,
        message: "Sale created successfully",
        data: sale,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const saleController = new SaleController();