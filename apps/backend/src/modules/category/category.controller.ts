import type { Request, Response, NextFunction } from "express";

import { categoryService } from "./category.service.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation.js";

export class CategoryController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createCategorySchema.parse(req.body);

      const category = await categoryService.create(data);

      res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.findAll();

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.findById(
        req.params.id as string
      );

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateCategorySchema.parse(req.body);

      const category = await categoryService.update(
        req.params.id as string,
        data
      );

      res.json({
        success: true,
        message: "Category updated successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await categoryService.delete(req.params.id as string);

      res.json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();