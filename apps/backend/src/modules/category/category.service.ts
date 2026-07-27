import { Category } from "@prisma/client";

import { categoryRepository } from "./category.repository.js";
import {
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "./category.validation.js";

import { AppError } from "../../shared/errors/app-error.js";

export class CategoryService {
  async create(data: CreateCategoryDTO): Promise<Category> {
    const existing = await categoryRepository.findByName(data.name);

    if (existing) {
      throw new AppError(409, "Category already exists");
    }

    return categoryRepository.create(data);
  }

  async findAll(): Promise<Category[]> {
    return categoryRepository.findAll();
  }

  async findById(id: string): Promise<Category> {
    const category = await categoryRepository.findById(id);

    if (!category) {
      throw new AppError(404, "Category not found");
    }

    return category;
  }

  async update(
    id: string,
    data: UpdateCategoryDTO
  ): Promise<Category> {
    await this.findById(id);

    return categoryRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);

    await categoryRepository.delete(id);
  }
}

export const categoryService = new CategoryService();