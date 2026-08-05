"use client";

import { useMemo } from "react";
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
  invoiceNo: z.string().min(1, "Invoice number is required"),

  supplierId: z.string().min(1, "Supplier is required"),

  purchaseDate: z.string(),

  items: z.array(
    z.object({
      medicineId: z.string().min(1),

      quantity: z.coerce.number().min(1),

      purchasePrice: z.coerce.number().positive(),

      batchNo: z.string().min(1),

      expiryDate: z.string().min(1),

      manufacturingDate: z.string().optional(),

      rackLocation: z.string().optional(),
    })
  ).min(1),
});

type PurchaseFormInput = z.input<typeof purchaseSchema>;
type PurchaseFormData = z.output<typeof purchaseSchema>;

interface PurchaseFormProps {
  onSuccess?: () => void;
}

interface PurchaseFormProps {
  onSuccess?: () => void;
}

export function PurchaseForm({
  onSuccess,
}: PurchaseFormProps) {

  const createPurchase = useCreatePurchase();

  const { data: suppliers } = useSuppliers();

  const { data: medicines } = useMedicines();

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PurchaseFormInput, any, PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),

    defaultValues: {
      invoiceNo: "",

      supplierId: "",

      purchaseDate: new Date()
        .toISOString()
        .split("T")[0],

      items: [
        {
          medicineId: "",

          quantity: 1,

          purchasePrice: 0,

          batchNo: "",

          expiryDate: "",

          manufacturingDate: "",

          rackLocation: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items") as PurchaseFormData["items"];

    const grandTotal = useMemo(() => {
  return items.reduce((total, item) => {
    return (
      total +
      Number(item.quantity) * Number(item.purchasePrice)
    );
  }, 0);
}, [items]);

  async function onSubmit(
  values: PurchaseFormData
) {
  try {
    await createPurchase.mutateAsync(values);

    toast.success("Purchase created successfully");

    reset();

    onSuccess?.();
  } catch (error) {
    console.error(error);

    toast.error("Failed to create purchase");
  }
}

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8"
    >
      <div className="grid grid-cols-3 gap-4">

        <div>
          <Label>Supplier</Label>

          <select
            {...register("supplierId")}
            className="h-10 w-full rounded-md border px-3"
          >
            <option value="">
              Select Supplier
            </option>

            {suppliers?.data.map((supplier) => (
              <option
                key={supplier.id}
                value={supplier.id}
              >
                {supplier.name}
              </option>
            ))}
          </select>

          <p className="text-xs text-red-500">
            {errors.supplierId?.message}
          </p>
        </div>

        <div>
          <Label>Invoice No</Label>

          <Input
            {...register("invoiceNo")}
          />

          <p className="text-xs text-red-500">
            {errors.invoiceNo?.message}
          </p>
        </div>

        <div>
          <Label>Purchase Date</Label>

          <Input
            type="date"
            {...register("purchaseDate")}
          />
        </div>
      </div>

      <div className="rounded-xl border">

        <div className="grid grid-cols-8 gap-4 border-b bg-muted p-4 font-medium">
          <div>Medicine</div>
          <div>Qty</div>
          <div>Price</div>  
          <div>Batch</div>
          <div>Expiry</div>
          <div>Rack</div>
          <div>Total</div>
          <div></div>
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-8 gap-4 border-b p-4"
          >
            <select
              {...register(
                `items.${index}.medicineId`
              )}
              className="rounded-md border p-2"
            >
              <option value="">
                Select
              </option>

              {medicines?.data.map((medicine) => (
                <option
                  key={medicine.id}
                  value={medicine.id}
                >
                  {medicine.name}
                </option>
              ))}
            </select>

            <Input
              type="number"
              {...register(
                `items.${index}.quantity`
              )}
            />

            <Input
              type="number"
              step="0.01"
              {...register(
                `items.${index}.purchasePrice`
              )}
            />

            <Input
              {...register(
                `items.${index}.batchNo`
              )}
            />

            <Input
              type="date"
              {...register(
                `items.${index}.expiryDate`
              )}
            />
            <Input
              placeholder="Rack"
              {...register(`items.${index}.rackLocation`)}
              />
            <div className="flex items-center font-semibold">
              ₹
{(
  Number(items[index]?.quantity) *
  Number(items[index]?.purchasePrice)
).toFixed(2)}
            </div>

            <Button
              type="button"
              variant="destructive"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
            >
              Remove
            </Button>
          </div>
        ))}

      </div>

      <div className="flex items-center justify-between">

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              medicineId: "",
              quantity: 1,
              purchasePrice: 0,
              batchNo: "",
              expiryDate: "",
              manufacturingDate: "",
              rackLocation: "",
            })
          }
        >
          + Add Medicine
        </Button>

        <div className="text-xl font-bold">
          Grand Total :
          ₹{grandTotal.toFixed(2)}
        </div>
      </div>

      <div className="flex justify-end">

        <Button
          type="submit"
          disabled={createPurchase.isPending}
        >
          {createPurchase.isPending
            ? "Saving..."
            : "Save Purchase"}
        </Button>

      </div>
    </form>
  );
}