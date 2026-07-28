import { Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma.js";
import type { MedicineQuery } from "./medicine.query.js";
import { getPagination } from "../../shared/utils/pagination.js";
import { getSort } from "../../shared/utils/sort.js";

export const medicineRepository = {
  async create(data: Prisma.MedicineCreateInput) {
    return prisma.medicine.create({
      data,
      include: {
        category: true,
      },
    });
  },
async findByBatchNo(batchNo: string) {
  return prisma.medicine.findUnique({
    where: {
      batchNo,
    },
  });
},
  async findAll(query: MedicineQuery) {
    const { page, limit, skip, take } = getPagination(query);

    const orderBy = getSort(
      query,
      [
        "name",
        "genericName",
        "brand",
        "sellingPrice",
        "stock",
        "createdAt",
      ] as const,
      "createdAt"
    );

    const where: Prisma.MedicineWhereInput = {
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
            brand: {
              contains: query.search,
              mode: Prisma.QueryMode.insensitive,
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

      ...(query.expired && {
        expiryDate: {
          lt: new Date(),
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

  async findById(id: string) {
    return prisma.medicine.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  },

  async update(id: string, data: Prisma.MedicineUpdateInput) {
    return prisma.medicine.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  },

  async delete(id: string) {
    return prisma.medicine.delete({
      where: { id },
    });
  },
};