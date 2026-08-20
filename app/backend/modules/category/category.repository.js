import { prisma } from "../../database/prisma.js";
export class CategoryRepository {
    async create(data) {
        return prisma.category.create({
            data,
        });
    }
    async findAll() {
        return prisma.category.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    async findById(id) {
        return prisma.category.findUnique({
            where: {
                id,
            },
        });
    }
    async findByName(name) {
        return prisma.category.findUnique({
            where: {
                name,
            },
        });
    }
    async update(id, data) {
        return prisma.category.update({
            where: {
                id,
            },
            data,
        });
    }
    async delete(id) {
        return prisma.category.delete({
            where: {
                id,
            },
        });
    }
}
export const categoryRepository = new CategoryRepository();
//# sourceMappingURL=category.repository.js.map