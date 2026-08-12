import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { medicineService } from "./medicine.service.js";

import {
  createMedicineSchema,
  updateMedicineSchema,
} from "./medicine.validation.js";

import { medicineQuerySchema } from "./medicine.query.js";

export class MedicineController {
  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data =
        createMedicineSchema.parse(
          req.body
        );

      const medicine =
        await medicineService.create(
          data
        );

      res.status(201).json({
        success: true,
        message:
          "Medicine created successfully",
        data: medicine,
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const query =
        medicineQuerySchema.parse(
          req.query
        );

      const result =
        await medicineService.findAll(
          query
        );

      res.status(200).json({
        success: true,
        data: result.medicines,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const medicine =
        await medicineService.findById(
          req.params.id as string
        );

      res.status(200).json({
        success: true,
        data: medicine,
      });
    } catch (error) {
      next(error);
    }
  }

  async findGroupedById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result =
        await medicineService.findGroupedById(
          req.params.id as string
        );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data =
        updateMedicineSchema.parse(
          req.body
        );

      const medicine =
        await medicineService.update(
          req.params.id as string,
          data
        );

      res.status(200).json({
        success: true,
        message:
          "Medicine updated successfully",
        data: medicine,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      await medicineService.delete(
        req.params.id as string
      );

      res.status(200).json({
        success: true,
        message:
          "Medicine deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export const medicineController =
  new MedicineController();