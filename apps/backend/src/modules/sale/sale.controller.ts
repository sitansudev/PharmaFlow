import { Request, Response } from "express";

import { saleService } from "./sale.service.js";

export class SaleController {
  async create(req: Request, res: Response) {
    const sale = await saleService.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: sale,
    });
  }

  async getAll(_req: Request, res: Response) {
    const sales = await saleService.getAll();

    return res.status(200).json({
      success: true,
      data: sales,
    });
  }

  async getById(
    req: Request<{ id: string }>,
    res: Response
  ) {
    const sale = await saleService.getById(req.params.id);

    return res.status(200).json({
      success: true,
      data: sale,
    });
  }
}

export const saleController = new SaleController();