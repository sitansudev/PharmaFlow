"use client";

import { useState } from "react";
import {
  useFieldArray,
  useForm,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useCreateSale } from "@/hooks/use-create-sale";
import { useMedicines } from "@/hooks/use-medicines";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const saleSchema = z.object({
  invoiceNo: z
    .string()
    .min(1, "Invoice number is required"),

  customerId: z
    .string()
    .optional()
    .default(""),

  paymentMethod: z.enum([
    "CASH",
    "ESEWA",
    "FONEPAY",
  ]),

  discountPercent: z.coerce
    .number()
    .min(0, "Discount cannot be negative")
    .max(
      100,
      "Discount cannot exceed 100%"
    )
    .default(0),

  items: z
    .array(
      z.object({
        medicineId: z
          .string()
          .min(1, "Medicine is required"),

        batchId: z
          .string()
          .min(1, "Batch is required"),

        quantity: z.coerce
          .number()
          .int()
          .min(
            1,
            "Quantity must be at least 1"
          ),
      })
    )
    .min(
      1,
      "At least one medicine is required"
    ),
});

type SaleFormInput =
  z.input<typeof saleSchema>;

type SaleFormData =
  z.output<typeof saleSchema>;

interface SaleFormProps {
  onSuccess?: () => void;
}

export function SaleForm({
  onSuccess,
}: SaleFormProps) {
  const createSale = useCreateSale();

  const {
    data: medicinesResponse,
    isLoading,
  } = useMedicines(100);

  const medicines =
    medicinesResponse?.data ?? [];

  const [
    medicineSearch,
    setMedicineSearch,
  ] = useState("");

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
    SaleFormInput,
    any,
    SaleFormData
  >({
    resolver:
      zodResolver(saleSchema),

    defaultValues: {
      invoiceNo: `INV-${Date.now()}`,

      customerId: "",

      paymentMethod: "CASH",

      discountPercent: 0,

      items: [
        {
          medicineId: "",
          batchId: "",
          quantity: 1,
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

  const items = watch("items");

  const discountPercent =
    Number(
      watch("discountPercent") || 0
    );

  /*
   * Find a batch across all medicines.
   */
  const getBatch = (
    batchId: string
  ) => {
    for (const medicine of medicines) {
      const batch =
        medicine.batches.find(
          (batch) =>
            batch.id === batchId
        );

      if (batch) {
        return {
          batch,
          medicine,
        };
      }
    }

    return null;
  };

  /*
   * Calculate the current sale total.
   *
   * IMPORTANT:
   *
   * Selling price is now taken from
   * the selected batch's MRP.
   *
   * There is no Medicine.sellingPrice
   * anymore.
   */
  const currentTotal = items.reduce(
    (total, item) => {
      const result = getBatch(
        item.batchId
      );

      if (!result) {
        return total;
      }

      const price =
        Number(result.batch.mrp) || 0;

      const quantity =
        Number(item.quantity) || 0;

      return (
        total +
        price * quantity
      );
    },
    0
  );

  /*
   * Calculate actual rupee discount.
   */
  const discountAmount =
    Number(
      (
        (currentTotal *
          discountPercent) /
        100
      ).toFixed(2)
    );

  /*
   * Final amount payable.
   */
  const grandTotal =
    Number(
      (
        currentTotal -
        discountAmount
      ).toFixed(2)
    );

  async function onSubmit(
    data: SaleFormData
  ) {
    try {
      await createSale.mutateAsync({
        invoiceNo:
          data.invoiceNo,

        customerId:
          data.customerId ||
          undefined,

        paymentMethod:
          data.paymentMethod,

        discountPercent:
          Number(
            data.discountPercent || 0
          ),

        items: data.items.map(
          (item) => ({
            batchId:
              item.batchId,

            quantity:
              item.quantity,
          })
        ),
      });

      toast.success(
        "Sale created successfully"
      );

      reset({
        invoiceNo: `INV-${Date.now()}`,

        customerId: "",

        paymentMethod: "CASH",

        discountPercent: 0,

        items: [
          {
            medicineId: "",
            batchId: "",
            quantity: 1,
          },
        ],
      });

      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Failed to create sale"
      );
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center">
        Loading medicines...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* ====================================================== */}
      {/* INVOICE */}
      {/* ====================================================== */}

      <div className="space-y-2">
        <Label>
          Invoice Number
        </Label>

        <Input
          {...register("invoiceNo")}
          readOnly
        />

        {errors.invoiceNo && (
          <p className="text-sm text-red-500">
            {
              errors.invoiceNo
                .message
            }
          </p>
        )}
      </div>

      {/* ====================================================== */}
      {/* ITEMS */}
      {/* ====================================================== */}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Medicines
          </h3>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                medicineId: "",
                batchId: "",
                quantity: 1,
              })
            }
          >
            + Add Medicine
          </Button>
        </div>

        {fields.map(
          (field, index) => {
            const selectedMedicine =
              medicines.find(
                (item) =>
                  item.id ===
                  items[index]
                    ?.medicineId
              );

            const selectedBatch =
              selectedMedicine?.batches.find(
                (batch) =>
                  batch.id ===
                  items[index]
                    ?.batchId
              );

            const quantity =
              Number(
                items[index]
                  ?.quantity
              ) || 0;

            /*
             * Sale price comes from
             * selected batch MRP.
             */
            const salePrice =
              selectedBatch
                ? Number(
                    selectedBatch.mrp
                  )
                : 0;

            const subtotal =
              salePrice * quantity;

            return (
              <div
                key={field.id}
                className="rounded-xl border p-5"
              >
                <div className="grid gap-4 md:grid-cols-4">

                  {/* ================================================== */}
                  {/* MEDICINE */}
                  {/* ================================================== */}

                  <div className="relative space-y-2">
                    <Label>
                      Medicine
                    </Label>

                    <Input
                      placeholder="Search medicine..."
                      value={
                        openMedicineIndex ===
                        index
                          ? medicineSearch
                          : selectedMedicine?.name ??
                            ""
                      }
                      onFocus={() => {
                        setOpenMedicineIndex(
                          index
                        );

                        setMedicineSearch(
                          selectedMedicine?.name ??
                            ""
                        );
                      }}
                      onChange={(
                        event
                      ) => {
                        const value =
                          event.target
                            .value;

                        setOpenMedicineIndex(
                          index
                        );

                        setMedicineSearch(
                          value
                        );

                        if (
                          value !==
                          selectedMedicine?.name
                        ) {
                          setValue(
                            `items.${index}.medicineId`,
                            ""
                          );

                          setValue(
                            `items.${index}.batchId`,
                            ""
                          );
                        }
                      }}
                    />

                    {openMedicineIndex ===
                      index && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-md border bg-white shadow-lg">
                        {medicines
                          .filter(
                            (
                              medicineOption
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
                                medicineOption.name
                                  .toLowerCase()
                                  .includes(
                                    search
                                  ) ||
                                medicineOption.genericName
                                  ?.toLowerCase()
                                  .includes(
                                    search
                                  )
                              );
                            }
                          )
                          .map(
                            (
                              medicineOption
                            ) => (
                              <button
                                key={
                                  medicineOption.id
                                }
                                type="button"
                                className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-slate-100"
                                onClick={() => {
                                  const firstAvailableBatch =
                                    medicineOption.batches.find(
                                      (
                                        batch
                                      ) =>
                                        batch.remainingQuantity >
                                        0
                                    );

                                  setValue(
                                    `items.${index}.medicineId`,
                                    medicineOption.id,
                                    {
                                      shouldValidate:
                                        true,
                                    }
                                  );

                                  /*
                                   * Automatically select
                                   * the first available
                                   * batch when possible.
                                   */
                                  setValue(
                                    `items.${index}.batchId`,
                                    medicineOption
                                      .batches
                                      .length ===
                                      1
                                      ? medicineOption
                                          .batches[0]
                                          ?.id ??
                                        ""
                                      : firstAvailableBatch
                                        ?.id ??
                                        "",
                                    {
                                      shouldValidate:
                                        true,
                                    }
                                  );

                                  setMedicineSearch(
                                    medicineOption.name
                                  );

                                  setOpenMedicineIndex(
                                    null
                                  );
                                }}
                              >
                                <span className="font-medium">
                                  {
                                    medicineOption.name
                                  }
                                </span>

                                {medicineOption.genericName && (
                                  <span className="text-xs text-muted-foreground">
                                    {
                                      medicineOption.genericName
                                    }
                                  </span>
                                )}

                                <span className="text-xs text-muted-foreground">
                                  Stock:{" "}
                                  {
                                    medicineOption.stock
                                  }
                                </span>
                              </button>
                            )
                          )}

                        {medicines.filter(
                          (
                            medicineOption
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
                              medicineOption.name
                                .toLowerCase()
                                .includes(
                                  search
                                ) ||
                              medicineOption.genericName
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
                      <p className="text-sm text-red-500">
                        Medicine is required
                      </p>
                    )}
                  </div>

                  {/* ================================================== */}
                  {/* BATCH */}
                  {/* ================================================== */}

                  <div className="space-y-2">
                    <Label>
                      Batch
                    </Label>

                    <select
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={
                        items[index]
                          ?.batchId ??
                        ""
                      }
                      onChange={(
                        event
                      ) =>
                        setValue(
                          `items.${index}.batchId`,
                          event.target
                            .value,
                          {
                            shouldValidate:
                              true,
                          }
                        )
                      }
                    >
                      <option value="">
                        Select batch
                      </option>

                      {(
                        selectedMedicine?.batches ??
                        []
                      ).map(
                        (batch) => (
                          <option
                            key={
                              batch.id
                            }
                            value={
                              batch.id
                            }
                            disabled={
                              batch.remainingQuantity <=
                              0
                            }
                          >
                            {
                              batch.batchNo
                            }{" "}
                            —{" "}
                            {
                              batch.remainingQuantity
                            }{" "}
                            left — MRP ₹
                            {Number(
                              batch.mrp
                            ).toFixed(2)}
                          </option>
                        )
                      )}
                    </select>

                    {errors.items?.[
                      index
                    ]?.batchId && (
                      <p className="text-sm text-red-500">
                        Batch is required
                      </p>
                    )}
                  </div>

                  {/* ================================================== */}
                  {/* QUANTITY */}
                  {/* ================================================== */}

                  <div className="space-y-2">
                    <Label>
                      Quantity
                    </Label>

                    <Input
                      type="number"
                      min={1}
                      max={
                        selectedBatch?.remainingQuantity ??
                        undefined
                      }
                      {...register(
                        `items.${index}.quantity`
                      )}
                    />

                    {selectedBatch && (
                      <p className="text-xs text-muted-foreground">
                        Available:{" "}
                        {
                          selectedBatch.remainingQuantity
                        }
                      </p>
                    )}

                    {errors.items?.[
                      index
                    ]?.quantity && (
                      <p className="text-sm text-red-500">
                        Quantity must be at least 1
                      </p>
                    )}
                  </div>

                  {/* ================================================== */}
                  {/* SUBTOTAL */}
                  {/* ================================================== */}

                  <div className="space-y-2">
                    <Label>
                      Subtotal
                    </Label>

                    <div className="flex h-10 items-center rounded-md border bg-slate-50 px-3 font-semibold">
                      ₹
                      {subtotal.toFixed(
                        2
                      )}
                    </div>
                  </div>
                </div>

                {/* ==================================================== */}
                {/* SELECTED MEDICINE INFO */}
                {/* ==================================================== */}

                {selectedMedicine && (
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {selectedMedicine.name}

                      {selectedBatch && (
                        <>
                          {" · MRP ₹"}
                          {Number(
                            selectedBatch.mrp
                          ).toFixed(2)}

                          {" / "}

                        </>
                      )}
                    </span>

                    {fields.length >
                      1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          remove(index)
                        }
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>

      {/* ====================================================== */}
      {/* PAYMENT METHOD */}
      {/* ====================================================== */}

      <div className="space-y-2">
        <Label>
          Payment Method
        </Label>

        <select
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          {...register(
            "paymentMethod"
          )}
        >
          <option value="CASH">
            Cash
          </option>

          <option value="ESEWA">
            eSewa
          </option>

          <option value="FONEPAY">
            FonePay
          </option>
        </select>

        {errors.paymentMethod && (
          <p className="text-sm text-red-500">
            Select a payment method
          </p>
        )}
      </div>

      {/* ====================================================== */}
      {/* DISCOUNT + TOTALS */}
      {/* ====================================================== */}

      <div className="rounded-xl border bg-slate-50 p-6">
        <div className="space-y-4">

          {/* Current Total */}

          <div className="flex items-center justify-between">
            <span className="text-base font-medium">
              Current Total
            </span>

            <span className="text-xl font-bold">
              ₹
              {currentTotal.toFixed(
                2
              )}
            </span>
          </div>

          {/* Discount */}

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label>
                Discount
              </Label>

              <p className="mt-1 text-xs text-muted-foreground">
                Optional
              </p>
            </div>

            <div className="flex w-36 items-center">
              <Input
                type="number"
                min={0}
                max={100}
                step="0.01"
                placeholder="0"
                className="rounded-r-none text-right"
                {...register(
                  "discountPercent"
                )}
              />

              <div className="flex h-10 items-center rounded-r-md border border-l-0 bg-white px-3 text-sm font-semibold">
                %
              </div>
            </div>
          </div>

          {errors.discountPercent && (
            <p className="text-right text-sm text-red-500">
              {
                errors.discountPercent
                  .message
              }
            </p>
          )}

          {/* Discount Amount */}

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Discount Amount
            </span>

            <span className="font-semibold text-red-600">
              - ₹
              {discountAmount.toFixed(
                2
              )}
            </span>
          </div>

          <div className="border-t pt-4" />

          {/* Grand Total */}

          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">
              Grand Total
            </span>

            <span className="text-2xl font-bold">
              ₹
              {grandTotal.toFixed(
                2
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* SUBMIT */}
      {/* ====================================================== */}

      <Button
        type="submit"
        className="w-full"
        disabled={
          createSale.isPending
        }
      >
        {createSale.isPending
          ? "Creating Sale..."
          : "Complete Sale"}
      </Button>
    </form>
  );
}