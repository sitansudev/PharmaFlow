"use client";

import { useMemo } from "react";
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
import type { PaymentMethod } from "@/types/sale";
const saleSchema = z.object({
  invoiceNo: z.string().min(1),

  customerId: z.string().optional().default(""),

  paymentMethod: z.enum([
    "CASH",
    "ESEWA",
    "FONEPAY",
  ]),

  items: z
    .array(
      z.object({
        batchId: z.string().min(1),
        quantity: z.coerce.number().int().min(1),
      })
    )
    .min(1),
});

type SaleFormInput = z.input<typeof saleSchema>;
type SaleFormData = z.output<typeof saleSchema>;

interface SaleFormProps {
  onSuccess?: () => void;
}

export function SaleForm({ onSuccess }: SaleFormProps) {
  const createSale = useCreateSale();
  const { data: medicinesResponse, isLoading } = useMedicines();

  const medicines = medicinesResponse?.data ?? [];

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SaleFormInput, any, SaleFormData>({
    resolver: zodResolver(saleSchema),

    defaultValues: {
  invoiceNo: `INV-${Date.now()}`,

  customerId: "",

  paymentMethod: "CASH",

  items: [
        {
          batchId: "",
          quantity: 1,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items");

  const getBatch = (batchId: string) => {
    for (const medicine of medicines) {
      const batch = medicine.batches.find(
        (batch) => batch.id === batchId
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

  const grandTotal = useMemo(() => {
    return items.reduce((total, item) => {
      const result = getBatch(item.batchId);

      if (!result) {
        return total;
      }

      return (
        total +
        Number(result.medicine.sellingPrice) *
          Number(item.quantity || 0)
      );
    }, 0);
  }, [items, medicines]);

  async function onSubmit(data: SaleFormData) {
    try {
      await createSale.mutateAsync({
  invoiceNo: data.invoiceNo,

  customerId:
    data.customerId || undefined,

  paymentMethod:
    data.paymentMethod,

  items: data.items,
});
      toast.success("Sale created successfully");

      reset({
  invoiceNo: `INV-${Date.now()}`,
  customerId: "",
  paymentMethod: "CASH",
  items: [
    {
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
      {/* Invoice */}

      <div className="space-y-2">
        <Label>Invoice Number</Label>

        <Input
          {...register("invoiceNo")}
          readOnly
        />

        {errors.invoiceNo && (
          <p className="text-sm text-red-500">
            {errors.invoiceNo.message}
          </p>
        )}
      </div>

      {/* Items */}

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
                batchId: "",
                quantity: 1,
              })
            }
          >
            + Add Medicine
          </Button>
        </div>

        {fields.map((field, index) => {
          const selectedBatch = getBatch(
            items[index]?.batchId
          );

          const medicine = selectedBatch?.medicine;
          const batch = selectedBatch?.batch;

          const quantity =
            Number(items[index]?.quantity) || 0;

          const subtotal =
            medicine
              ? Number(medicine.sellingPrice) *
                quantity
              : 0;

          return (
            <div
              key={field.id}
              className="rounded-xl border p-5"
            >
              <div className="grid gap-4 md:grid-cols-4">
                {/* Medicine */}

                <div className="space-y-2">
                  <Label>Medicine</Label>

                  <select
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={
                      medicine?.id ?? ""
                    }
                    onChange={(event) => {
                      const medicineId =
                        event.target.value;

                      setValue(
                        `items.${index}.batchId`,
                        ""
                      );

                      const selectedMedicine =
                        medicines.find(
                          (medicine) =>
                            medicine.id ===
                            medicineId
                        );

                      if (
                        selectedMedicine?.batches
                          ?.length === 1
                      ) {
                        setValue(
                          `items.${index}.batchId`,
                          selectedMedicine.batches[0]
                            .id
                        );
                      }
                    }}
                  >
                    <option value="">
                      Select medicine
                    </option>

                    {medicines.map((medicine) => (
                      <option
                        key={medicine.id}
                        value={medicine.id}
                      >
                        {medicine.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Batch */}

                <div className="space-y-2">
                  <Label>Batch</Label>

                  <select
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={
                      items[index]?.batchId ?? ""
                    }
                    onChange={(event) =>
                      setValue(
                        `items.${index}.batchId`,
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Select batch
                    </option>

                    {(medicine?.batches ?? []).map(
                      (batch) => (
                        <option
                          key={batch.id}
                          value={batch.id}
                          disabled={
                            batch.remainingQuantity <=
                            0
                          }
                        >
                          {batch.batchNo} —{" "}
                          {batch.remainingQuantity} left
                        </option>
                      )
                    )}
                  </select>

                  {errors.items?.[index]?.batchId && (
                    <p className="text-sm text-red-500">
                      Select a batch
                    </p>
                  )}
                </div>

                {/* Quantity */}

                <div className="space-y-2">
                  <Label>Quantity</Label>

                  <Input
                    type="number"
                    min={1}
                    max={
                      batch?.remainingQuantity ??
                      undefined
                    }
                    {...register(
                      `items.${index}.quantity`
                    )}
                  />

                  {batch && (
                    <p className="text-xs text-muted-foreground">
                      Available:{" "}
                      {batch.remainingQuantity}
                    </p>
                  )}
                </div>

                {/* Subtotal */}

                <div className="space-y-2">
                  <Label>Subtotal</Label>

                  <div className="flex h-10 items-center rounded-md border bg-slate-50 px-3 font-semibold">
                    ₹{subtotal.toFixed(2)}
                  </div>
                </div>
              </div>

              {medicine && (
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {medicine.name} · ₹
                    {Number(
                      medicine.sellingPrice
                    ).toFixed(2)}{" "}
                    / {medicine.unit}
                  </span>

                  {fields.length > 1 && (
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
        })}
      </div>
{/* Payment Method */}

<div className="space-y-2">
  <Label>Payment Method</Label>

  <select
    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
    {...register("paymentMethod")}
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
      {/* Total */}

      <div className="flex items-center justify-between rounded-xl border bg-slate-50 p-6">
        <span className="text-lg font-semibold">
          Grand Total
        </span>

        <span className="text-2xl font-bold">
          ₹{grandTotal.toFixed(2)}
        </span>
      </div>

      {/* Submit */}

      <Button
        type="submit"
        className="w-full"
        disabled={createSale.isPending}
      >
        {createSale.isPending
          ? "Creating Sale..."
          : "Complete Sale"}
      </Button>
    </form>
  );
}