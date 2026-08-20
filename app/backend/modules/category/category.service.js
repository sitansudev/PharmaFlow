import { categoryRepository } from "./category.repository.js";
import { AppError } from "../../shared/errors/app-error.js";
export class CategoryService {
    async create(data) {
        const existing = await categoryRepository.findByName(data.name);
        if (existing) {
            throw new AppError(409, "Category already exists");
        }
        return categoryRepository.create(data);
    }
    async findAll() {
        return categoryRepository.findAll();
    }
    async findById(id) {
        const category = await categoryRepository.findById(id);
        if (!category) {
            throw new AppError(404, "Category not found");
        }
        return category;
    }
    async update(id, data) {
        await this.findById(id);
        return categoryRepository.update(id, data);
    }
    async delete(id) {
        await this.findById(id);
        await categoryRepository.delete(id);
    }
}
export const categoryService = new CategoryService();
//# sourceMappingURL=category.service.js.map