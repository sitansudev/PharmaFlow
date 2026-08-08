"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SaleTable } from "@/components/sale/sale-table";
import { useSales } from "@/hooks/use-sales";

export default function SalesPage() {
  const {
    data,
    isLoading,
    isError,
  } = useSales();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            Sales
          </h1>

          <p className="text-muted-foreground">
            Manage pharmacy sales.
          </p>
        </div>

        <div className="rounded-xl border bg-white p-16 text-center">
          Loading sales...
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Sales
            </h1>

            <p className="text-muted-foreground">
              Manage pharmacy sales.
            </p>
          </div>

          <Link href="/sales/new">
            <Button>
              + New Sale
            </Button>
          </Link>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-16 text-center text-red-600">
          Failed to load sales.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Sales
          </h1>

          <p className="text-muted-foreground">
            Manage pharmacy sales.
          </p>
        </div>

        <Link href="/sales/new">
          <Button>
            + New Sale
          </Button>
        </Link>
      </div>

      {/* History */}

      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            Sales History
          </h2>

          <p className="text-sm text-muted-foreground">
            {data.data.length} sale
            {data.data.length !== 1 ? "s" : ""} recorded
          </p>
        </div>

        <SaleTable sales={data.data} />
      </div>
    </div>
  );
}