import { categoryService } from "./category.service.js";
import { createCategorySchema, updateCategorySchema, } from "./category.validation.js";
export class CategoryController {
    async create(req, res, next) {
        try {
            const data = createCategorySchema.parse(req.body);
            const category = await categoryService.create(data);
            res.status(201).json({
                success: true,
                message: "Category created successfully",
                data: category,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async findAll(_req, res, next) {
        try {
            const categories = await categoryService.findAll();
            res.json({
                success: true,
                data: categories,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async findById(req, res, next) {
        try {
            const category = await categoryService.findById(req.params.id);
            res.json({
                success: true,
                data: category,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const data = updateCategorySchema.parse(req.body);
            const category = await categoryService.update(req.params.id, data);
            res.json({
                success: true,
                message: "Category updated successfully",
                data: category,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            await categoryService.delete(req.params.id);
            res.json({
                success: true,
                message: "Category deleted successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export const categoryController = new CategoryController();
//# sourceMappingURL=category.controller.js.map