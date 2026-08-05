"use client";

import { AddPurchaseDialog } from "@/components/purchase/add-purchase-dialog";
import { PurchaseTable } from "@/components/purchase/purchase-table";
import { usePurchases } from "@/hooks/use-purchases";

export default function PurchasesPage() {
  const { data, isLoading, isError } = usePurchases();

  if (isLoading) {
    return (
      <div className="p-8">
        Loading purchases...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-red-500">
        Failed to load purchases.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Purchases
          </h1>

          <p className="text-muted-foreground">
            Manage supplier purchases and inventory.
          </p>
        </div>

        <AddPurchaseDialog />
      </div>

      <PurchaseTable purchases={data.data} />
    </div>
  );
}