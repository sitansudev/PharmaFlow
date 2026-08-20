import { prisma } from "../../database/prisma.js";
export class SupplierRepository {
    async create(data) {
        return prisma.supplier.create({
            data,
        });
    }
    async findAll() {
        return prisma.supplier.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    async findById(id) {
        return prisma.supplier.findUnique({
            where: {
                id,
            },
        });
    }
    async findByPhone(phone) {
        return prisma.supplier.findUnique({
            where: {
                phone,
            },
        });
    }
    async findByEmail(email) {
        return prisma.supplier.findUnique({
            where: {
                email,
            },
        });
    }
    async update(id, data) {
        return prisma.supplier.update({
            where: {
                id,
            },
            data,
        });
    }
    async delete(id) {
        return prisma.supplier.delete({
            where: {
                id,
            },
        });
    }
}
export const supplierRepository = new SupplierRepository();
//# sourceMappingURL=supplier.repository.js.map