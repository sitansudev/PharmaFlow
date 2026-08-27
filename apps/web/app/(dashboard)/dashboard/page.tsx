"use client";

import {
  IndianRupee,
  Package,
  ShoppingCart,
  TriangleAlert,
} from "lucide-react";

import { KPICard } from "@/components/dashboard/kpi-card";
import { ExpiringMedicines } from "@/components/dashboard/expiring-medicines";
import { LowStockMedicines } from "@/components/dashboard/low-stock-medicines";
import { useDashboard } from "@/hooks/use-dashboard";

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="p-8">
        Loading Dashboard...
      </div>
    );
  }

  if (isError || !data) {
    console.error(error);

    return (
      <div className="p-8 text-red-500">
        Failed to load dashboard.
      </div>
    );
  }

  const dashboardData = data.data;

  if (!dashboardData) {
    return (
      <div className="p-8 text-red-500">
        Invalid dashboard response.
      </div>
    );
  }

  const stats = dashboardData.stats;

  return (
    <div className="mx-auto max-w-7xl space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard
        </h1>

        <p className="mt-1 text-gray-500">
          Pharmacy Overview
        </p>
      </div>


      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">

        <KPICard
          title="Total Sales"
          value={`₹${stats.totalSales}`}
          description="Overall sales"
          icon={IndianRupee}
        />


        <KPICard
          title="Medicines"
          value={stats.totalMedicines}
          description="Registered medicines"
          icon={Package}
        />


        <KPICard
          title="Low Stock"
          value={stats.lowStockCount}
          description="Need restocking"
          icon={TriangleAlert}
        />


        <KPICard
          title="Purchases"
          value={`₹${stats.totalPurchases}`}
          description="Overall purchases"
          icon={ShoppingCart}
        />

      </div>


      {/* Low Stock Medicines */}
      <LowStockMedicines
        medicines={dashboardData.lowStockMedicines}
      />


      {/* Near Expiry Medicines */}
      <ExpiringMedicines
        medicines={dashboardData.expiringMedicines}
      />

    </div>
  );
}