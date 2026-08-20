import { Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma.js";
import { getPagination } from "../../shared/utils/pagination.js";
import { getSort } from "../../shared/utils/sort.js";
export const medicineRepository = {
    async create(data) {
        return prisma.medicine.create({
            data,
            include: {
                category: true,
                batches: {
                    include: {
                        supplier: true,
                    },
                    orderBy: {
                        expiryDate: "asc",
                    },
                },
            },
        });
    },
    async findAll(query) {
        const { page, limit, skip, take } = getPagination(query);
        const orderBy = getSort(query, [
            "name",
            "genericName",
            "stock",
            "createdAt",
        ], "createdAt");
        const where = {
            ...(query.search && {
                OR: [
                    {
                        name: {
                            contains: query.search,
                            mode: Prisma.QueryMode.insensitive,
                        },
                    },
                    {
                        genericName: {
                            contains: query.search,
                            mode: Prisma.QueryMode.insensitive,
                        },
                    },
                    {
                        batches: {
                            some: {
                                batchNo: {
                                    contains: query.search,
                                    mode: Prisma.QueryMode.insensitive,
                                },
                            },
                        },
                    },
                    {
                        batches: {
                            some: {
                                supplier: {
                                    name: {
                                        contains: query.search,
                                        mode: Prisma.QueryMode.insensitive,
                                    },
                                },
                            },
                        },
                    },
                ],
            }),
            ...(query.categoryId && {
                categoryId: query.categoryId,
            }),
            ...(query.inStock && {
                stock: {
                    gt: 0,
                },
            }),
            ...(query.lowStock && {
                stock: {
                    lte: 10,
                },
            }),
        };
        const [medicines, total] = await Promise.all([
            prisma.medicine.findMany({
                where,
                skip,
                take,
                orderBy,
                include: {
                    category: true,
                    batches: {
                        include: {
                            supplier: true,
                        },
                        orderBy: {
                            expiryDate: "asc",
                        },
                    },
                },
            }),
            prisma.medicine.count({
                where,
            }),
        ]);
        return {
            medicines,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    },
    async findById(id) {
        return prisma.medicine.findUnique({
            where: {
                id,
            },
            include: {
                category: true,
                batches: {
                    include: {
                        supplier: true,
                    },
                    orderBy: {
                        expiryDate: "asc",
                    },
                },
            },
        });
    },
    async update(id, data) {
        return prisma.medicine.update({
            where: {
                id,
            },
            data,
            include: {
                category: true,
                batches: {
                    include: {
                        supplier: true,
                    },
                    orderBy: {
                        expiryDate: "asc",
                    },
                },
            },
        });
    },
    async delete(id) {
        return prisma.medicine.delete({
            where: {
                id,
            },
        });
    },
};
//# sourceMappingURL=medicine.repository.js.map