import { prisma } from "../../database/prisma.js";

export class DashboardService {
  async getStats() {
    const today = new Date();

    const expiryLimit = new Date();
    expiryLimit.setDate(today.getDate() + 90);

    const [
      totalMedicines,
      totalCategories,
      totalSuppliers,
      totalCustomers,
      totalSales,
      totalPurchases,

      lowStockMedicines,
      expiringBatches,
      expiredBatches,

      recentSales,
      recentPurchases,
    ] = await Promise.all([
      prisma.medicine.count(),

      prisma.category.count(),

      prisma.supplier.count(),

      prisma.customer.count(),

      prisma.sale.aggregate({
        _sum: {
          totalAmount: true,
        },
      }),

      prisma.purchase.aggregate({
        _sum: {
          totalAmount: true,
        },
      }),

      prisma.medicine.findMany({
        where: {
          stock: {
            lte: 10,
          },
        },
        include: {
          category: true,
        },
        orderBy: {
          stock: "asc",
        },
      }),

      prisma.medicineBatch.findMany({
        where: {
          expiryDate: {
            gte: today,
            lte: expiryLimit,
          },
          remainingQuantity: {
            gt: 0,
          },
        },
        include: {
          medicine: {
            include: {
              category: true,
            },
          },
          supplier: true,
        },
        orderBy: {
          expiryDate: "asc",
        },
      }),

      prisma.medicineBatch.findMany({
        where: {
          expiryDate: {
            lt: today,
          },
          remainingQuantity: {
            gt: 0,
          },
        },
        include: {
          medicine: {
            include: {
              category: true,
            },
          },
          supplier: true,
        },
        orderBy: {
          expiryDate: "asc",
        },
      }),

      prisma.sale.findMany({
        orderBy: {
          saleDate: "desc",
        },
        take: 10,
        include: {
          customer: true,
        },
      }),

      prisma.purchase.findMany({
        orderBy: {
          purchaseDate: "desc",
        },
        take: 10,
        include: {
          supplier: true,
        },
      }),
    ]);

    return {
      stats: {
        totalMedicines,
        totalCategories,
        totalSuppliers,
        totalCustomers,

        totalSales: totalSales._sum.totalAmount ?? 0,
        totalPurchases: totalPurchases._sum.totalAmount ?? 0,

        lowStockCount: lowStockMedicines.length,
        expiringCount: expiringBatches.length,
        expiredCount: expiredBatches.length,
      },

      lowStockMedicines,

      expiringMedicines: expiringBatches,

      expiredMedicines: expiredBatches,

      recentSales,

      recentPurchases,
    };
  }
}

export const dashboardService = new DashboardService();