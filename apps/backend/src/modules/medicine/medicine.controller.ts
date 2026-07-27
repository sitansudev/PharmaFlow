import type { Request, Response, NextFunction } from "express";

import { medicineService } from "./medicine.service.js";
import {
  createMedicineSchema,
  updateMedicineSchema,
} from "./medicine.validation.js";

export class MedicineController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createMedicineSchema.parse(req.body);

      const medicine = await medicineService.create(data);

      res.status(201).json({
        success: true,
        message: "Medicine created successfully",
        data: medicine,
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const medicines = await medicineService.findAll();

      res.json({
        success: true,
        data: medicines,
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const medicine = await medicineService.findById(req.params.id as string);

      res.json({
        success: true,
        data: medicine,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateMedicineSchema.parse(req.body);

      const medicine = await medicineService.update(
        req.params.id as string,
        data
      );

      res.json({
        success: true,
        message: "Medicine updated successfully",
        data: medicine,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await medicineService.delete(req.params.id as string);

      res.json({
        success: true,
        message: "Medicine deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export const medicineController = new MedicineController();