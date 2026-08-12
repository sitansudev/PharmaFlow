"use client";

import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useCreatePurchase } from "@/hooks/use-create-purchase";
import { useMedicines } from "@/hooks/use-medicines";
import { useSuppliers } from "@/hooks/use-suppliers";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const purchaseSchema = z.object({
  invoiceNo: z
    .string()
    .min(1, "Invoice number is required"),

  uniqueNumber: z
    .string()
    .optional(),

  supplierId: z
    .string()
    .min(1, "Supplier is required"),

  purchaseDate: z
    .string(),

  items: z
    .array(
      z.object({
        medicineId: z
          .string()
          .min(1, "Medicine is required"),

        pack: z
          .string()
          .min(1, "Pack is required"),

        quantity: z
          .coerce
          .number()
          .int()
          .min(1),

        bonus: z
          .coerce
          .number()
          .int()
          .min(0),

        rate: z
          .coerce
          .number()
          .positive(),

        discount: z
          .coerce
          .number()
          .min(0)
          .max(100),

        purchasePrice: z
          .coerce
          .number()
          .positive(),

        mrp: z
          .coerce
          .number()
          .positive(),

        batchNo: z
          .string()
          .min(1, "Batch number is required"),

        expiryDate: z
          .string()
          .min(1, "Expiry date is required"),

        rackLocation: z
          .string()
          .optional(),
      })
    )
    .min(1),
});

type PurchaseFormInput =
  z.input<typeof purchaseSchema>;

type PurchaseFormData =
  z.output<typeof purchaseSchema>;

interface PurchaseFormProps {
  onSuccess?: () => void;
}

export function PurchaseForm({
  onSuccess,
}: PurchaseFormProps) {
  const createPurchase =
    useCreatePurchase();

  const { data: suppliers } =
    useSuppliers();

  const { data: medicines } =
    useMedicines();

  const medicineList =
    medicines?.data ?? [];

  const [medicineSearch, setMedicineSearch] =
    useState("");

  const [
    openMedicineIndex,
    setOpenMedicineIndex,
  ] = useState<number | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<
    PurchaseFormInput,
    any,
    PurchaseFormData
  >({
    resolver:
      zodResolver(purchaseSchema),

    defaultValues: {
      invoiceNo: "",
      uniqueNumber: "",
      supplierId: "",

      purchaseDate: new Date()
        .toISOString()
        .split("T")[0],

      items: [
        {
          medicineId: "",
          pack: "",
          quantity: 1,
          bonus: 0,
          rate: 0,
          discount: 0,
          purchasePrice: 0,
          mrp: 0,
          batchNo: "",
          expiryDate: "",
          rackLocation: "",
        },
      ],
    },
  });

  const {
    fields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch(
    "items"
  ) as PurchaseFormData["items"];

  const grandTotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total +
        Number(item.quantity) *
          Number(item.purchasePrice),
      0
    );
  }, [items]);

  async function onSubmit(
    values: PurchaseFormData
  ) {
    try {
      await createPurchase.mutateAsync(
        values
      );

      toast.success(
        "Purchase created successfully"
      );

      reset();

      onSuccess?.();
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to create purchase"
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8"
    >
      {/* Purchase Information */}

      <div className="grid grid-cols-4 gap-4">
        <div>
          <Label>Supplier *</Label>

          <select
            {...register("supplierId")}
            className="h-10 w-full rounded-md border px-3"
          >
            <option value="">
              Select Supplier
            </option>

            {suppliers?.data.map(
              (supplier) => (
                <option
                  key={supplier.id}
                  value={supplier.id}
                >
                  {supplier.name}
                </option>
              )
            )}
          </select>

          {errors.supplierId && (
            <p className="text-xs text-red-500">
              {errors.supplierId.message}
            </p>
          )}
        </div>

        <div>
          <Label>Invoice No *</Label>

          <Input
            {...register("invoiceNo")}
          />

          {errors.invoiceNo && (
            <p className="text-xs text-red-500">
              {errors.invoiceNo.message}
            </p>
          )}
        </div>

        <div>
          <Label>
            Unique Number
          </Label>

          <Input
            {...register(
              "uniqueNumber"
            )}
            placeholder="Optional (e.g. A1)"
          />
        </div>

        <div>
          <Label>Purchase Date</Label>

          <Input
            type="date"
            {...register(
              "purchaseDate"
            )}
          />
        </div>
      </div>

      {/* Purchase Items */}

      <div className="overflow-x-auto rounded-xl border">
        <div className="min-w-[1800px]">

          {/* Header */}

          <div className="grid grid-cols-[2.5fr_1fr_0.8fr_0.8fr_1fr_1fr_1.2fr_1.1fr_1.1fr_1.1fr_1.1fr_0.8fr] gap-3 border-b bg-muted p-4 text-sm font-semibold">
            <div>Medicine *</div>
            <div>Pack *</div>
            <div>Qty *</div>
            <div>Bonus</div>
            <div>Rate *</div>
            <div>Discount %</div>
            <div>Purchase Price *</div>
            <div>MRP *</div>
            <div>Batch No *</div>
            <div>Expiry *</div>
            <div>Rack</div>
            <div>Action</div>
          </div>

          {fields.map(
            (field, index) => {
              const selectedMedicine =
                medicineList.find(
                  (medicine) =>
                    medicine.id ===
                    items[index]
                      ?.medicineId
                );

              const itemTotal =
                Number(
                  items[index]?.quantity
                ) *
                Number(
                  items[index]
                    ?.purchasePrice
                );

              return (
                <div
                  key={field.id}
                  className="grid grid-cols-[2.5fr_1fr_0.8fr_0.8fr_1fr_1fr_1.2fr_1.1fr_1.1fr_1.1fr_1.1fr_0.8fr] items-center gap-3 border-b p-4"
                >

                  {/* Medicine */}

                  <div className="relative">
                    <Input
                      className="h-11"
                      placeholder="Search medicine..."
                      value={
                        openMedicineIndex ===
                        index
                          ? medicineSearch
                          : selectedMedicine
                              ?.name ??
                            ""
                      }
                      onFocus={() => {
                        setOpenMedicineIndex(
                          index
                        );

                        setMedicineSearch(
                          selectedMedicine
                            ?.name ?? ""
                        );
                      }}
                      onChange={(event) => {
                        const value =
                          event.target
                            .value;

                        setOpenMedicineIndex(
                          index
                        );

                        setMedicineSearch(
                          value
                        );

                        setValue(
                          `items.${index}.medicineId`,
                          ""
                        );
                      }}
                    />

                    {openMedicineIndex ===
                      index && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-md border bg-white shadow-lg">
                        {medicineList
                          .filter(
                            (
                              medicine
                            ) => {
                              const search =
                                medicineSearch
                                  .toLowerCase()
                                  .trim();

                              if (
                                !search
                              ) {
                                return true;
                              }

                              return (
                                medicine.name
                                  .toLowerCase()
                                  .includes(
                                    search
                                  ) ||
                                medicine.genericName
                                  ?.toLowerCase()
                                  .includes(
                                    search
                                  )
                              );
                            }
                          )
                          .map(
                            (
                              medicine
                            ) => (
                              <button
                                key={
                                  medicine.id
                                }
                                type="button"
                                className="flex w-full items-start px-3 py-2 text-left hover:bg-slate-100"
                                onClick={() => {
                                  setValue(
                                    `items.${index}.medicineId`,
                                    medicine.id,
                                    {
                                      shouldValidate:
                                        true,
                                    }
                                  );

                                  setMedicineSearch(
                                    medicine.name
                                  );

                                  setOpenMedicineIndex(
                                    null
                                  );
                                }}
                              >
                                <div>
                                  <div className="font-medium">
                                    {
                                      medicine.name
                                    }
                                  </div>

                                  {medicine.genericName && (
                                    <div className="text-xs text-muted-foreground">
                                      {
                                        medicine.genericName
                                      }
                                    </div>
                                  )}
                                </div>
                              </button>
                            )
                          )}

                        {medicineList.filter(
                          (medicine) => {
                            const search =
                              medicineSearch
                                .toLowerCase()
                                .trim();

                            if (
                              !search
                            ) {
                              return true;
                            }

                            return (
                              medicine.name
                                .toLowerCase()
                                .includes(
                                  search
                                ) ||
                              medicine.genericName
                                ?.toLowerCase()
                                .includes(
                                  search
                                )
                            );
                          }
                        ).length ===
                          0 && (
                          <div className="px-3 py-3 text-sm text-muted-foreground">
                            No medicines found.
                          </div>
                        )}
                      </div>
                    )}

                    {errors.items?.[
                      index
                    ]?.medicineId && (
                      <p className="text-xs text-red-500">
                        Medicine required
                      </p>
                    )}
                  </div>

                  {/* Pack */}

                  <Input
                    placeholder="e.g. 10 TAB"
                    {...register(
                      `items.${index}.pack`
                    )}
                  />

                  {/* Quantity */}

                  <Input
                    type="number"
                    min="1"
                    {...register(
                      `items.${index}.quantity`
                    )}
                  />

                  {/* Bonus */}

                  <Input
                    type="number"
                    min="0"
                    {...register(
                      `items.${index}.bonus`
                    )}
                  />

                  {/* Rate */}

                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register(
                      `items.${index}.rate`
                    )}
                  />

                  {/* Discount */}

                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    {...register(
                      `items.${index}.discount`
                    )}
                  />

                  {/* Purchase Price */}

                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register(
                      `items.${index}.purchasePrice`
                    )}
                  />

                  {/* MRP */}

                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register(
                      `items.${index}.mrp`
                    )}
                  />

                  {/* Batch */}

                  <Input
                    {...register(
                      `items.${index}.batchNo`
                    )}
                  />

                  {/* Expiry */}

                  <Input
                    type="date"
                    {...register(
                      `items.${index}.expiryDate`
                    )}
                  />

                  {/* Rack */}

                  <Input
                    placeholder="Rack"
                    {...register(
                      `items.${index}.rackLocation`
                    )}
                  />

                  {/* Action */}

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() =>
                      remove(index)
                    }
                    disabled={
                      fields.length === 1
                    }
                  >
                    Remove
                  </Button>

                  {/* Total */}

                  <div className="hidden">
                    ₹
                    {itemTotal.toFixed(
                      2
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Add medicine + total */}

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              medicineId: "",
              pack: "",
              quantity: 1,
              bonus: 0,
              rate: 0,
              discount: 0,
              purchasePrice: 0,
              mrp: 0,
              batchNo: "",
              expiryDate: "",
              rackLocation: "",
            })
          }
        >
          + Add Medicine
        </Button>

        <div className="text-xl font-bold">
          Grand Total: ₹
          {grandTotal.toFixed(2)}
        </div>
      </div>

      {/* Submit */}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={
            createPurchase.isPending
          }
        >
          {createPurchase.isPending
            ? "Saving..."
            : "Save Purchase"}
        </Button>
      </div>
    </form>
  );
}