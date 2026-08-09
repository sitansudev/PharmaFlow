"use client";

import {
  DollarSign,
  Package,
  ShoppingCart,
  TriangleAlert,
} from "lucide-react";

import { KPICard } from "@/components/dashboard/kpi-card";
import { ExpiringMedicines } from "@/components/dashboard/expiring-medicines";
import { useDashboard } from "@/hooks/use-dashboard";
import { LowStockMedicines } from "@/components/dashboard/low-stock-medicines";
export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return <div className="p-8">Loading Dashboard...</div>;
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-red-500">
        Failed to load dashboard.
      </div>
    );
  }

  const stats = data.data.stats;
  console.log(JSON.stringify(data.data.expiringMedicines, null, 2));
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

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">

        <KPICard
          title="Total Sales"
          value={`₹${stats.totalSales}`}
          description="Overall sales"
          icon={DollarSign}
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
        <LowStockMedicines
         medicines={data.data.lowStockMedicines}
        />

      {/* Near Expiry */}

      <ExpiringMedicines
        medicines={data.data.expiringMedicines}
      />

    </div>
  );
}