"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { medicineService } from "@/services/medicine.service";
import { Button } from "@/components/ui/button";

export default function MedicineDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["medicine-grouped", id],
    queryFn: () =>
      medicineService.getGroupedById(id),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="rounded-xl border bg-white p-8 text-center">
          Loading medicine details...
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="p-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="rounded-xl border bg-white p-8 text-center">
          <h2 className="text-lg font-semibold">
            Medicine not found
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Unable to load this medicine.
          </p>
        </div>
      </div>
    );
  }

  /*
   * The grouped API returns ALL Medicine records
   * with the same medicine identity.
   *
   * Example:
   *
   * Rabi-20 / 20
   * Rabi-20 / 50
   *
   * These are treated as ONE medicine on this page.
   */
  const grouped = data.data;

  const medicines = grouped.medicines ?? [];

  /*
   * Flatten all batches from all medicine variants.
   *
   * Medicine A
   *   -> Supplier X
   *
   * Medicine B
   *   -> Supplier Y
   *
   * becomes:
   *
   * Rabi-20
   *   -> Supplier X
   *   -> Supplier Y
   */
  const batches = medicines.flatMap((medicine) =>
    (medicine.batches ?? []).map((batch) => ({
      ...batch,

      medicineId: medicine.id,

      medicineUnit: medicine.unit,

      medicineStock: medicine.stock,
    }))
  );

  /*
   * Type representing a batch together with
   * the medicine information it belongs to.
   */
  type BatchWithMedicine =
    (typeof batches)[number];

  type SupplierGroup = {
    supplier: BatchWithMedicine["supplier"];
    batches: BatchWithMedicine[];
  };

  /*
   * Group batches by supplier.
   */
  const supplierMap =
    new Map<string, SupplierGroup>();

  for (const batch of batches) {
    const supplierId =
      batch.supplier?.id ?? "unknown";

    const existing =
      supplierMap.get(supplierId);

    if (existing) {
      existing.batches.push(batch);
    } else {
      supplierMap.set(supplierId, {
        supplier: batch.supplier,
        batches: [batch],
      });
    }
  }

  const supplierGroups =
    Array.from(supplierMap.entries());

  /*
   * Calculate total bonus units.
   */
  const totalBonus = batches.reduce(
    (total: number, batch) =>
      total + Number(batch.bonus ?? 0),
    0
  );

  /*
   * Calculate total physical units received.
   */
  const totalPhysicalUnits = batches.reduce(
    (total: number, batch) =>
      total + Number(batch.quantity ?? 0),
    0
  );

  /*
   * Calculate total remaining stock across
   * all batches.
   */
  const totalRemainingUnits = batches.reduce(
    (total: number, batch) =>
      total +
      Number(batch.remainingQuantity ?? 0),
    0
  );

  /*
   * Grouped stock comes from backend.
   */
  const totalStock =
    Number(grouped.totalStock ?? 0);

  return (
    <div className="space-y-6 p-6">
      {/* ====================================================== */}
      {/* BACK */}
      {/* ====================================================== */}

      <Button
        variant="outline"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Medicines
      </Button>

      {/* ====================================================== */}
      {/* MEDICINE HEADER */}
      {/* ====================================================== */}

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {grouped.name}
            </h1>

            {grouped.genericName && (
              <p className="mt-1 text-sm text-muted-foreground">
                {grouped.genericName}
              </p>
            )}

            <p className="mt-1 text-sm text-muted-foreground">
              {medicines.length} variant
              {medicines.length === 1
                ? ""
                : "s"}

              {grouped.category?.name
                ? ` • ${grouped.category.name}`
                : ""}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Current Stock */}

            <div className="rounded-lg border px-5 py-3 text-center">
              <div className="text-xs text-muted-foreground">
                Current Stock
              </div>

              <div className="text-xl font-bold">
                {totalStock}
              </div>

              <div className="text-xs text-muted-foreground">
                units
              </div>
            </div>

            {/* Suppliers */}

            <div className="rounded-lg border px-5 py-3 text-center">
              <div className="text-xs text-muted-foreground">
                Suppliers
              </div>

              <div className="text-xl font-bold">
                {grouped.totalSuppliers}
              </div>

              <div className="text-xs text-muted-foreground">
                suppliers
              </div>
            </div>

            {/* Bonus */}

            <div className="rounded-lg border px-5 py-3 text-center">
              <div className="text-xs text-muted-foreground">
                Total Bonus
              </div>

              <div className="text-xl font-bold">
                {totalBonus}
              </div>

              <div className="text-xs text-muted-foreground">
                units
              </div>
            </div>

            {/* Remaining */}

            <div className="rounded-lg border px-5 py-3 text-center">
              <div className="text-xs text-muted-foreground">
                Batch Remaining
              </div>

              <div className="text-xl font-bold">
                {totalRemainingUnits}
              </div>

              <div className="text-xs text-muted-foreground">
                units
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* VARIANT SUMMARY */}
      {/* ====================================================== */}

      {medicines.length > 1 && (
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b p-5">
            <h2 className="text-lg font-semibold">
              Medicine Variants
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              These records are combined because they
              represent the same medicine.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="whitespace-nowrap px-5 py-3 text-left">
                    Medicine
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-center">
                    Unit
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-center">
                    Stock
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-center">
                    Batches
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-right">
                    MRP
                  </th>
                </tr>
              </thead>

              <tbody>
                {medicines.map((medicine) => {
                  /*
                   * Use the earliest-expiring/current batch
                   * for the displayed MRP.
                   */
                  const currentBatch =
                    medicine.batches?.[0];

                  return (
                    <tr
                      key={medicine.id}
                      className="border-b last:border-0 hover:bg-muted/20"
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-semibold">
                        {medicine.name}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-center">
                        {medicine.unit}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-center font-semibold">
                        {medicine.stock}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-center">
                        {medicine.batches?.length ?? 0}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right font-semibold">
                        ₹
                        {Number(
                          currentBatch?.mrp ?? 0
                        ).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* SUPPLIER COMPARISON */}
      {/* ====================================================== */}

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold">
            Supplier Comparison
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Compare all suppliers and every purchase
            batch for {grouped.name}.
          </p>
        </div>

        <div className="p-5">
          {supplierGroups.length === 0 ? (
            <div className="rounded-lg border p-10 text-center text-sm text-muted-foreground">
              No supplier purchase records found.
            </div>
          ) : (
            <div className="space-y-6">
              {supplierGroups.map(
                ([supplierId, group]) => {
                  const supplierBatches =
                    group.batches;

                  /*
                   * Purchased quantity excludes bonus.
                   */
                  const supplierPurchased =
                    supplierBatches.reduce(
                      (
                        total: number,
                        batch
                      ) =>
                        total +
                        Math.max(
                          Number(
                            batch.quantity
                          ) -
                            Number(
                              batch.bonus
                            ),
                          0
                        ),
                      0
                    );

                  /*
                   * Bonus quantity.
                   */
                  const supplierBonus =
                    supplierBatches.reduce(
                      (
                        total: number,
                        batch
                      ) =>
                        total +
                        Number(
                          batch.bonus ?? 0
                        ),
                      0
                    );

                  /*
                   * Total physical units.
                   */
                  const supplierTotal =
                    supplierBatches.reduce(
                      (
                        total: number,
                        batch
                      ) =>
                        total +
                        Number(
                          batch.quantity ?? 0
                        ),
                      0
                    );

                  /*
                   * Remaining units.
                   */
                  const supplierRemaining =
                    supplierBatches.reduce(
                      (
                        total: number,
                        batch
                      ) =>
                        total +
                        Number(
                          batch.remainingQuantity ??
                            0
                        ),
                      0
                    );

                  return (
                    <div
                      key={supplierId}
                      className="overflow-hidden rounded-xl border"
                    >
                      {/* Supplier Header */}

                      <div className="flex flex-col gap-4 border-b bg-muted/30 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <h3 className="text-base font-bold">
                            {group.supplier?.name ??
                              "Unknown Supplier"}
                          </h3>

                          <p className="text-xs text-muted-foreground">
                            {
                              supplierBatches.length
                            }{" "}
                            purchase{" "}
                            {supplierBatches.length ===
                            1
                              ? "batch"
                              : "batches"}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full border bg-white px-3 py-1.5 font-medium">
                            Purchased:{" "}
                            {supplierPurchased}
                          </span>

                          <span className="rounded-full border bg-white px-3 py-1.5 font-medium">
                            Bonus:{" "}
                            {supplierBonus}
                          </span>

                          <span className="rounded-full border bg-white px-3 py-1.5 font-medium">
                            Total:{" "}
                            {supplierTotal}
                          </span>

                          <span className="rounded-full border bg-white px-3 py-1.5 font-medium">
                            Remaining:{" "}
                            {supplierRemaining}
                          </span>
                        </div>
                      </div>

                      {/* Supplier Batches */}

                      <div className="overflow-x-auto">
                        <table className="min-w-[1600px] w-full text-sm">
                          <thead>
                            <tr className="border-b bg-white">
                              <th className="whitespace-nowrap px-4 py-3 text-left">
                                Batch
                              </th>

                              <th className="whitespace-nowrap px-4 py-3 text-left">
                                Pack
                              </th>

                              <th className="whitespace-nowrap px-4 py-3 text-center">
                                Unit
                              </th>

                              <th className="whitespace-nowrap px-4 py-3 text-center">
                                Purchased
                              </th>

                              <th className="whitespace-nowrap px-4 py-3 text-center">
                                Bonus
                              </th>

                              <th className="whitespace-nowrap px-4 py-3 text-center">
                                Total Units
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
                                MRP
                              </th>

                              <th className="whitespace-nowrap px-4 py-3 text-left">
                                Expiry
                              </th>

                              <th className="whitespace-nowrap px-4 py-3 text-center">
                                Rack
                              </th>

                              <th className="whitespace-nowrap px-4 py-3 text-center">
                                Status
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {supplierBatches.map(
                              (batch) => {
                                /*
                                 * Purchased units exclude bonus.
                                 */
                                const purchasedUnits =
                                  Math.max(
                                    Number(
                                      batch.quantity
                                    ) -
                                      Number(
                                        batch.bonus
                                      ),
                                    0
                                  );

                                const totalUnits =
                                  Number(
                                    batch.quantity
                                  );

                                const remaining =
                                  Number(
                                    batch.remainingQuantity
                                  );

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
                                  remaining <= 0;

                                const expired =
                                  days < 0;

                                return (
                                  <tr
                                    key={batch.id}
                                    className="border-b last:border-0 hover:bg-muted/20"
                                  >
                                    {/* Batch */}

                                    <td className="whitespace-nowrap px-4 py-4 font-semibold">
                                      {batch.batchNo}
                                    </td>

                                    {/* Pack */}

                                    <td className="whitespace-nowrap px-4 py-4">
                                      {batch.pack}
                                    </td>

                                    {/* Unit */}

                                    <td className="whitespace-nowrap px-4 py-4 text-center font-medium">
                                      {
                                        batch.medicineUnit
                                      }
                                    </td>

                                    {/* Purchased */}

                                    <td className="whitespace-nowrap px-4 py-4 text-center">
                                      {
                                        purchasedUnits
                                      }
                                    </td>

                                    {/* Bonus */}

                                    <td className="whitespace-nowrap px-4 py-4 text-center font-semibold">
                                      {batch.bonus}
                                    </td>

                                    {/* Total */}

                                    <td className="whitespace-nowrap px-4 py-4 text-center font-bold">
                                      {totalUnits}
                                    </td>

                                    {/* Remaining */}

                                    <td className="whitespace-nowrap px-4 py-4 text-center font-semibold">
                                      {remaining}
                                    </td>

                                    {/* Rate */}

                                    <td className="whitespace-nowrap px-4 py-4 text-right">
                                      ₹
                                      {Number(
                                        batch.rate
                                      ).toFixed(2)}
                                    </td>

                                    {/* Discount */}

                                    <td className="whitespace-nowrap px-4 py-4 text-right">
                                      {Number(
                                        batch.discount
                                      ).toFixed(2)}
                                      %
                                    </td>

                                    {/* MRP */}

                                    <td className="whitespace-nowrap px-4 py-4 text-right font-semibold">
                                      ₹
                                      {Number(
                                        batch.mrp
                                      ).toFixed(2)}
                                    </td>

                                    {/* Expiry */}

                                    <td className="whitespace-nowrap px-4 py-4">
                                      <div className="flex flex-col gap-1">
                                        <span>
                                          {expiry.toLocaleDateString()}
                                        </span>

                                        <span
                                          className={`w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${
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

                                    {/* Rack */}

                                    <td className="whitespace-nowrap px-4 py-4 text-center">
                                      {batch.rackLocation ??
                                        "-"}
                                    </td>

                                    {/* Status */}

                                    <td className="whitespace-nowrap px-4 py-4 text-center">
                                      <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                          finished
                                            ? "bg-slate-100 text-slate-600"
                                            : expired
                                            ? "bg-red-100 text-red-700"
                                            : "bg-green-100 text-green-700"
                                        }`}
                                      >
                                        {finished
                                          ? "Finished"
                                          : expired
                                          ? "Expired"
                                          : "Available"}
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
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}