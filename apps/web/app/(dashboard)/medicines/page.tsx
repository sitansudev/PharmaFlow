"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MedicineTable } from "@/components/medicine/medicine-table";
import { useMedicines } from "@/hooks/use-medicines";
import { AddMedicineDialog } from "@/components/medicine/add-medicine-dialog";
export default function MedicinesPage() {
  const [search, setSearch] = useState("");

  const {
    data,
    isLoading,
    isError,
  } = useMedicines(100, search);
  if (isLoading && !data) {
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

      <div className="relative max-w-xl">
  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

  <Input
    value={search}
    onChange={(event) =>
      setSearch(event.target.value)
    }
    placeholder="Search medicine, generic, batch or supplier..."
    className="pl-9"
  />
</div>

<MedicineTable medicines={data.data} />
    </div>
  );
}