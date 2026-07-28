import { prisma } from "../../database/prisma.js";

export class DashboardService {
  async getStats() {
    const [
      totalMedicines,
      totalCategories,
      totalSuppliers,
      totalCustomers,
      lowStock,
      totalSales,
      totalPurchases,
    ] = await Promise.all([
      prisma.medicine.count(),
      prisma.category.count(),
      prisma.supplier.count(),
      prisma.customer.count(),
      prisma.medicine.count({
        where: {
          stock: {
            lte: 10,
          },
        },
      }),
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
    ]);

    return {
      totalMedicines,
      totalCategories,
      totalSuppliers,
      totalCustomers,
      lowStock,

      totalSales: totalSales._sum.totalAmount ?? 0,
      totalPurchases: totalPurchases._sum.totalAmount ?? 0,
    };
  }
}

export const dashboardService = new DashboardService();