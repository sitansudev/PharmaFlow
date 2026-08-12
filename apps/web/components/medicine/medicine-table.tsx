"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
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

export function MedicineTable({
  medicines,
}: Props) {
  const router = useRouter();

  const deleteMedicine =
    useDeleteMedicine();

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

      toast.success(
        "Medicine deleted successfully"
      );
    } catch {
      toast.error(
        "Failed to delete medicine"
      );
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
      <div className="overflow-x-auto">
        <Table className="min-w-[1500px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px]">
                Medicine
              </TableHead>

              <TableHead className="w-[100px] whitespace-nowrap">
                Pack
              </TableHead>

              <TableHead className="w-[90px] whitespace-nowrap text-center">
                Unit
              </TableHead>

              <TableHead className="w-[100px] whitespace-nowrap text-center">
                Stock
              </TableHead>

              <TableHead className="w-[120px] whitespace-nowrap">
                Batch
              </TableHead>

              <TableHead className="w-[150px] whitespace-nowrap">
                Expiry
              </TableHead>

              <TableHead className="w-[120px] whitespace-nowrap text-right">
                Rate
              </TableHead>

              <TableHead className="w-[100px] whitespace-nowrap text-right">
                Disc.
              </TableHead>

              <TableHead className="w-[120px] whitespace-nowrap text-right">
                MRP
              </TableHead>

              <TableHead className="w-[100px] whitespace-nowrap text-center">
                Bonus
              </TableHead>

              <TableHead className="w-[90px] whitespace-nowrap text-center">
                Rack
              </TableHead>

              <TableHead className="w-[130px] whitespace-nowrap text-right">
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
                  {/* Main medicine row */}

                  <TableRow className="align-middle">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {medicine.batches?.length >
                          0 && (
                          <button
                            type="button"
                            onClick={() =>
                              toggleMedicine(
                                medicine.id
                              )
                            }
                            className="shrink-0 rounded p-1 hover:bg-muted"
                          >
                            {expanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        )}

                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/medicines/${medicine.id}`
                              )
                            }
                            className="truncate text-left font-semibold hover:text-primary hover:underline"
                          >
                            {medicine.name}
                          </button>

                          {medicine.genericName && (
                            <div className="truncate text-xs text-muted-foreground">
                              {medicine.genericName}
                            </div>
                          )}

                          <div className="text-xs text-muted-foreground">
                            {medicine.category?.name ??
                              "-"}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
                        {latestBatch?.pack ?? "-"}
                      </span>
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-center font-medium">
                      {medicine.unit}
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-center">
                      <span
                        className={`inline-flex min-w-[50px] justify-center rounded-full px-3 py-1 text-xs font-semibold ${
                          medicine.stock <=
                          medicine.minimumStock
                            ? "bg-red-100 text-red-700"
                            : medicine.stock <=
                              medicine.minimumStock *
                                2
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {medicine.stock}
                      </span>
                    </TableCell>

                    <TableCell className="whitespace-nowrap font-medium">
                      {latestBatch?.batchNo ?? "-"}
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      {latestBatch?.expiryDate
                        ? new Date(
                            latestBatch.expiryDate
                          ).toLocaleDateString()
                        : "-"}
                    </TableCell>

                    {/* RATE */}

                    <TableCell className="whitespace-nowrap text-right font-medium">
                      ₹
                      {Number(
                        latestBatch?.rate ?? 0
                      ).toFixed(2)}
                    </TableCell>

                    {/* DISCOUNT */}

                    <TableCell className="whitespace-nowrap text-right">
                      {Number(
                        latestBatch?.discount ?? 0
                      ).toFixed(2)}
                      %
                    </TableCell>

                    {/* MRP */}

                    <TableCell className="whitespace-nowrap text-right font-semibold">
                      ₹
                      {Number(
                        latestBatch?.mrp ?? 0
                      ).toFixed(2)}
                    </TableCell>

                    {/* BONUS */}

                    <TableCell className="whitespace-nowrap text-center font-semibold">
                      {latestBatch?.bonus ?? 0}
                    </TableCell>

                    {/* RACK */}

                    <TableCell className="whitespace-nowrap text-center">
                      {latestBatch?.rackLocation ??
                        "-"}
                    </TableCell>

                    {/* ACTIONS */}

                    <TableCell className="whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <EditMedicineDialog
                          medicine={medicine}
                        />

                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() =>
                            handleDelete(
                              medicine.id
                            )
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

                  {/* Expanded batch details */}

                  {expanded && (
                    <TableRow className="bg-muted/30">
                      <TableCell
                        colSpan={13}
                        className="p-4"
                      >
                        <div className="rounded-lg border bg-white">
                          <div className="border-b px-4 py-3">
                            <div className="font-semibold">
                              Batch Details
                            </div>

                            <div className="text-xs text-muted-foreground">
                              All batches for{" "}
                              {medicine.name}
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="min-w-[1450px] w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="whitespace-nowrap px-4 py-3 text-left">
                                    Batch No.
                                  </th>

                                  <th className="whitespace-nowrap px-4 py-3 text-left">
                                    Supplier
                                  </th>

                                  <th className="whitespace-nowrap px-4 py-3 text-left">
                                    Pack
                                  </th>

                                  <th className="whitespace-nowrap px-4 py-3 text-center">
                                    Unit
                                  </th>

                                  <th className="whitespace-nowrap px-4 py-3 text-center">
                                    Received
                                  </th>

                                  <th className="whitespace-nowrap px-4 py-3 text-center">
                                    Bonus
                                  </th>

                                  <th className="whitespace-nowrap px-4 py-3 text-center">
                                    Total Qty
                                  </th>

                                  <th className="whitespace-nowrap px-4 py-3 text-center">
                                    Remaining
                                  </th>

                                  <th className="whitespace-nowrap px-4 py-3 text-right">
                                    Rate
                                  </th>

                                  <th className="whitespace-nowrap px-4 py-3 text-right">
                                    Discount
                                  </th>

                                  <th className="whitespace-nowrap px-4 py-3 text-right">
                                    Purchase
                                  </th>

                                  <th className="whitespace-nowrap px-4 py-3 text-right">
                                    MRP
                                  </th>

                                  <th className="whitespace-nowrap px-4 py-3 text-left">
                                    Expiry
                                  </th>

                                  <th className="whitespace-nowrap px-4 py-3 text-center">
                                    Rack
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
                                        <td className="whitespace-nowrap px-4 py-3 font-medium">
                                          {
                                            batch.batchNo
                                          }
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3">
                                          {batch
                                            .supplier
                                            ?.name ??
                                            "-"}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3">
                                          {batch.pack}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-center font-medium">
                                          {
                                            medicine.unit
                                          }
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-center">
                                          {Math.max(
                                            batch.quantity -
                                              batch.bonus,
                                            0
                                          )}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-center font-semibold">
                                          {batch.bonus}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-center font-semibold">
                                          {
                                            batch.quantity
                                          }
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-center font-semibold">
                                          {
                                            batch.remainingQuantity
                                          }
                                        </td>

                                        {/* RATE */}

                                        <td className="whitespace-nowrap px-4 py-3 text-right">
                                          ₹
                                          {Number(
                                            batch.rate
                                          ).toFixed(
                                            2
                                          )}
                                        </td>

                                        {/* DISCOUNT */}

                                        <td className="whitespace-nowrap px-4 py-3 text-right">
                                          {Number(
                                            batch.discount
                                          ).toFixed(
                                            2
                                          )}
                                          %
                                        </td>

                                        {/* PURCHASE */}

                                        <td className="whitespace-nowrap px-4 py-3 text-right font-medium">
                                          ₹
                                          {Number(
                                            batch.rate
                                          ).toFixed(
                                            2
                                          )}
                                        </td>

                                        {/* MRP */}

                                        <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                                          ₹
                                          {Number(
                                            batch.mrp
                                          ).toFixed(
                                            2
                                          )}
                                        </td>

                                        {/* EXPIRY */}

                                        <td className="whitespace-nowrap px-4 py-3">
                                          <div className="flex flex-col items-start gap-1">
                                            <span>
                                              {expiry.toLocaleDateString()}
                                            </span>

                                            <span
                                              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
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
                                          </div>
                                        </td>

                                        {/* RACK */}

                                        <td className="whitespace-nowrap px-4 py-3 text-center">
                                          {batch.rackLocation ??
                                            "-"}
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
    </div>
  );
}