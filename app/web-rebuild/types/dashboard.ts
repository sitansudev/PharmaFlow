export interface DashboardStats {
  totalMedicines: number;
  totalCategories: number;
  totalSuppliers: number;
  totalCustomers: number;

  totalSales: number;
  totalPurchases: number;

  lowStockCount: number;
  expiringCount: number;
  expiredCount: number;
}

export interface DashboardMedicine {
  id: string;
  name: string;
  batchNo: string;
  stock: number;
  expiryDate: string;
}

export interface DashboardResponse {
  success: boolean;

  data: {
    stats: DashboardStats;

    lowStockMedicines: DashboardMedicine[];

    expiringMedicines: DashboardMedicine[];

    expiredMedicines: DashboardMedicine[];

    recentSales: unknown[];

    recentPurchases: unknown[];
  };
}