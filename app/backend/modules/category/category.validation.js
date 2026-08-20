import { z } from "zod";
export const createCategorySchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    categoryId: z.string().cuid().optional(),
});
export const updateCategorySchema = createCategorySchema.partial();
//# sourceMappingURL=category.validation.js.map