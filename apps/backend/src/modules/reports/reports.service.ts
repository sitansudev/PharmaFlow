import { prisma } from "../../database/prisma.js";

export class ReportsService {
  async dashboardSummary() {
    const today = new Date();

    const expiryLimit = new Date();
    expiryLimit.setDate(today.getDate() + 90);

    // Low stock calculation
    const medicines = await prisma.medicine.findMany({
      select: {
        stock: true,
        minimumStock: true,
      },
    });

    const lowStockCount = medicines.filter(
      (m) => m.stock <= m.minimumStock
    ).length;

    const [
      medicineCount,
      categoryCount,
      supplierCount,
      customerCount,
      totalSales,
      totalPurchases,
      expiringCount,
      expiredCount,
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

      prisma.medicineBatch.count({
        where: {
          expiryDate: {
            gte: today,
            lte: expiryLimit,
          },
          remainingQuantity: {
            gt: 0,
          },
        },
      }),

      prisma.medicineBatch.count({
        where: {
          expiryDate: {
            lt: today,
          },
          remainingQuantity: {
            gt: 0,
          },
        },
      }),
    ]);

    return {
      medicines: medicineCount,
      categories: categoryCount,
      suppliers: supplierCount,
      customers: customerCount,

      totalSales: Number(
        totalSales._sum.totalAmount ?? 0
      ),

      totalPurchases: Number(
        totalPurchases._sum.totalAmount ?? 0
      ),

      lowStock: lowStockCount,

      expiringBatches: expiringCount,

      expiredBatches: expiredCount,
    };
  }
}

export const reportsService = new ReportsService();