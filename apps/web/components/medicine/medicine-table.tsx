"use client";

import type { Medicine } from "@/types/medicine";

import { useDeleteMedicine } from "@/hooks/use-delete-medicine";

import { toast } from "sonner";

import { Trash2 } from "lucide-react";

import { EditMedicineDialog } from "./edit-medicine-dialog";

import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  medicines: Medicine[];
}

export function MedicineTable({ medicines }: Props) {
  const deleteMedicine = useDeleteMedicine();

  async function handleDelete(id: string) {
    if (
      !window.confirm(
        "Are you sure you want to delete this medicine?"
      )
    ) {
      return;
    }

    try {
      await deleteMedicine.mutateAsync(id);

      toast.success("Medicine deleted successfully");
    } catch {
      toast.error("Failed to delete medicine");
    }
  }

  if (medicines.length === 0) {
    return (
      <div className="rounded-xl border bg-white py-16 text-center">
        <h3 className="text-lg font-semibold">
          No medicines found
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Add your first medicine to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Medicine</TableHead>
            <TableHead>Generic</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead className="text-center">
              Stock
            </TableHead>
            <TableHead className="text-right">
              Purchase
            </TableHead>
            <TableHead className="text-right">
              Selling
            </TableHead>
            <TableHead>Expiry</TableHead>
            <TableHead className="text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {medicines.map((medicine) => {
            const batch = medicine.batches?.[0];

            const expiry = batch?.expiryDate
              ? new Date(batch.expiryDate)
              : null;

            const days = expiry
              ? Math.ceil(
                  (expiry.getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                )
              : null;

            return (
              <TableRow key={medicine.id}>
                <TableCell>
                  <div>
                    <div className="font-semibold">
                      {medicine.name}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Batch: {batch?.batchNo ?? "-"}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  {medicine.genericName ?? "-"}
                </TableCell>

                <TableCell>
                  {medicine.category?.name ?? "-"}
                </TableCell>

                <TableCell>
                  {batch?.supplier?.name ?? "-"}
                </TableCell>

                <TableCell className="text-center">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      medicine.stock <= medicine.minimumStock
                        ? "bg-red-100 text-red-700"
                        : medicine.stock <=
                          medicine.minimumStock * 2
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {medicine.stock}
                  </span>
                </TableCell>

                <TableCell className="text-right font-medium">
                  ₹
                  {Number(
                    batch?.purchasePrice ?? 0
                  ).toFixed(2)}
                </TableCell>

                <TableCell className="text-right font-semibold">
                  ₹
                  {Number(
                    medicine.sellingPrice
                  ).toFixed(2)}
                </TableCell>

                <TableCell>
                  {expiry ? (
                    <>
                      <div>
                        {expiry.toLocaleDateString()}
                      </div>

                      <div
                        className={`text-xs ${
                          days! < 0
                            ? "text-red-600"
                            : days! <= 90
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {days! < 0
                          ? "Expired"
                          : days! <= 90
                          ? "Expiring Soon"
                          : "Valid"}
                      </div>
                    </>
                  ) : (
                    "-"
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <EditMedicineDialog
                      medicine={medicine}
                    />

                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() =>
                        handleDelete(medicine.id)
                      }
                      disabled={
                        deleteMedicine.isPending
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}