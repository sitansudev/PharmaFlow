import { Request, Response } from "express";

type SupplierParams = {
  id: string;
};
import { supplierService } from "./supplier.service.js";
import {
  createSupplierSchema,
  updateSupplierSchema,
} from "./supplier.validation.js";

export class SupplierController {
  async create(req: Request, res: Response) {
    const data = createSupplierSchema.parse(req.body);

    const supplier = await supplierService.create(data);

    return res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      data: supplier,
    });
  }

  async findAll(_req: Request, res: Response) {
    const suppliers = await supplierService.findAll();

    return res.json({
      success: true,
      data: suppliers,
    });
  }

  async findById(req: Request<SupplierParams>, res: Response) {
  const supplier = await supplierService.findById(req.params.id);

  return res.json({
    success: true,
    data: supplier,
  });
}

  async update(req: Request<SupplierParams>, res: Response) {
  const data = updateSupplierSchema.parse(req.body);

  const supplier = await supplierService.update(req.params.id, data);

  return res.json({
    success: true,
    message: "Supplier updated successfully",
    data: supplier,
  });
}

  async delete(req: Request<SupplierParams>, res: Response) {
  await supplierService.delete(req.params.id);

  return res.json({
    success: true,
    message: "Supplier deleted successfully",
  });
}
}

export const supplierController = new SupplierController();