"use client";

import { Fragment, useState } from "react";
import type { Medicine } from "@/types/medicine";

import { useDeleteMedicine } from "@/hooks/use-delete-medicine";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  Trash2,
} from "lucide-react";

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

  const [expandedMedicine, setExpandedMedicine] =
    useState<string | null>(null);

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

  function toggleMedicine(id: string) {
    setExpandedMedicine((current) =>
      current === id ? null : id
    );
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
            <TableHead className="text-center">
              Stock
            </TableHead>
            <TableHead className="text-right">
              Purchase
            </TableHead>
            <TableHead className="text-right">
              Selling
            </TableHead>
            <TableHead>Batches</TableHead>
            <TableHead className="text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {medicines.map((medicine) => {
            const expanded =
              expandedMedicine === medicine.id;

            const activeBatches =
              medicine.batches?.filter(
                (batch) =>
                  batch.remainingQuantity > 0
              ) ?? [];

            const latestBatch =
              activeBatches[0] ??
              medicine.batches?.[0];

            return (
  <Fragment key={medicine.id}>
                <TableRow
                  key={medicine.id}
                  className="align-top"
                >
                  <TableCell>
                    <div className="flex items-start gap-2">
                      {medicine.batches?.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            toggleMedicine(
                              medicine.id
                            )
                          }
                          className="mt-0.5 rounded p-1 hover:bg-muted"
                        >
                          {expanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      )}

                      <div>
                        <div className="font-semibold">
                          {medicine.name}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {medicine.batches?.length ?? 0}{" "}
                          batch
                          {medicine.batches?.length ===
                          1
                            ? ""
                            : "es"}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {medicine.genericName ?? "-"}
                  </TableCell>

                  <TableCell>
                    {medicine.category?.name ?? "-"}
                  </TableCell>

                  <TableCell className="text-center">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        medicine.stock <=
                        medicine.minimumStock
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
                      latestBatch?.purchasePrice ?? 0
                    ).toFixed(2)}
                  </TableCell>

                  <TableCell className="text-right font-semibold">
                    ₹
                    {Number(
                      medicine.sellingPrice
                    ).toFixed(2)}
                  </TableCell>

                  <TableCell>
                    {medicine.batches?.length ?? 0}
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

                {expanded && (
                  <TableRow
                    key={`${medicine.id}-batches`}
                    className="bg-muted/30"
                  >
                    <TableCell colSpan={8}>
                      <div className="rounded-lg border bg-white p-4">
                        <div className="mb-3 font-semibold">
                          Batch Details
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[800px] text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="w-[15%] pb-3 text-left">
                                  Batch
                                </th>

                                <th className="w-[20%] pb-3 text-left">
                                  Supplier
                                </th>

                                <th className="w-[12%] pb-3 text-center">
                                  Stock
                                </th>

                                <th className="w-[15%] pb-3 text-right">
                                  Purchase
                                </th>

                                <th className="w-[18%] pb-3 pl-8 text-left">
                                  Expiry
                                </th>

                                <th className="w-[20%] pb-3 text-left">
                                  Status
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {medicine.batches.map(
                                (batch) => {
                                  const expiry =
                                    new Date(
                                      batch.expiryDate
                                    );

                                  const days =
                                    Math.ceil(
                                      (expiry.getTime() -
                                        Date.now()) /
                                        (1000 *
                                          60 *
                                          60 *
                                          24)
                                    );

                                  const finished =
                                    batch.remainingQuantity <=
                                    0;

                                  const expired =
                                    days < 0;

                                  return (
                                    <tr
                                      key={batch.id}
                                      className="border-b last:border-0"
                                    >
                                      <td className="py-3 font-medium">
                                        {batch.batchNo}
                                      </td>

                                      <td className="py-3">
                                        {batch.supplier
                                          ?.name ?? "-"}
                                      </td>

                                      <td className="py-3 text-center">
                                        {
                                          batch.remainingQuantity
                                        }
                                      </td>

                                      <td className="py-3 text-right font-medium">
                                        ₹
                                        {Number(
                                          batch.purchasePrice
                                        ).toFixed(2)}
                                      </td>

                                      <td className="whitespace-nowrap py-3 pl-8">
                                        {expiry.toLocaleDateString()}
                                      </td>

                                      <td className="py-3">
                                        <span
                                          className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                                            finished
                                              ? "bg-slate-100 text-slate-600"
                                              : expired
                                              ? "bg-red-100 text-red-700"
                                              : days <=
                                                90
                                              ? "bg-yellow-100 text-yellow-700"
                                              : "bg-green-100 text-green-700"
                                          }`}
                                        >
                                          {finished
                                            ? "Finished"
                                            : expired
                                            ? "Expired"
                                            : days <=
                                              90
                                            ? "Expiring Soon"
                                            : "Valid"}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                }
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}