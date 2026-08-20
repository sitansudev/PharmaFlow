"use client";

import { AddSupplierDialog } from "@/components/supplier/add-supplier-dialog";
import { SupplierTable } from "@/components/supplier/supplier-table";

import { useSuppliers } from "@/hooks/use-suppliers";

export default function SuppliersPage() {
  const { data, isLoading, isError } = useSuppliers();

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-red-500">
        Failed to load suppliers.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Suppliers
          </h1>

          <p className="text-muted-foreground">
            Manage medicine suppliers.
          </p>
        </div>

        <AddSupplierDialog />
      </div>

      <SupplierTable
        suppliers={data.data}
      />
    </div>
  );
}