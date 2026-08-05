"use client";

import { Button } from "@/components/ui/button";
import { MedicineTable } from "@/components/medicine/medicine-table";
import { useMedicines } from "@/hooks/use-medicines";
import { AddMedicineDialog } from "@/components/medicine/add-medicine-dialog";
export default function MedicinesPage() {
  const { data, isLoading, isError } = useMedicines();

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-red-500">
        Failed to load medicines.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Medicines
          </h1>

          <p className="text-muted-foreground">
            Manage all medicines in your pharmacy.
          </p>
        </div>

        <AddMedicineDialog />
      </div>

      <MedicineTable medicines={data.data} />
    </div>
  );
}