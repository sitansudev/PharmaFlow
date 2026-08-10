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
  const medicineList = medicines?.data ?? [];

const [medicineSearch, setMedicineSearch] = useState("");
const [openMedicineIndex, setOpenMedicineIndex] =
  useState<number | null>(null);
  const {
  register,
  control,
  handleSubmit,
  watch,
  setValue,
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

      <div className="overflow-x-auto rounded-xl border">
      <div className="min-w-[1250px]">

    <div className="grid grid-cols-[2.5fr_0.7fr_1.2fr_1.2fr_1.3fr_1.3fr_1.1fr_1.1fr_0.8fr] gap-3 border-b bg-muted p-4 text-sm font-semibold">
  <div>Medicine</div>
  <div>Qty</div>
  <div>Purchase Price</div>
  <div>Batch No</div>
  <div>Expiry Date</div>
  <div>Mfg. Date</div>
  <div>Rack Location</div>
  <div>Total</div>
  <div>Action</div>
</div>
        </div>

        {fields.map((field, index) => (
          <div
  key={field.id}
  className="grid grid-cols-[2.5fr_0.7fr_1.2fr_1.2fr_1.3fr_1.3fr_1.1fr_1.1fr_0.8fr] items-center gap-3 border-b p-4"
>
            <div className="relative">
  <Input
  className="h-11"
  placeholder="Search medicine..."
    value={
      openMedicineIndex === index
        ? medicineSearch
        : medicineList.find(
            (medicine) =>
              medicine.id ===
              items[index]?.medicineId
          )?.name ?? ""
    }
    onFocus={() => {
      setOpenMedicineIndex(index);

      const selectedMedicine =
        medicineList.find(
          (medicine) =>
            medicine.id ===
            items[index]?.medicineId
        );

      setMedicineSearch(
        selectedMedicine?.name ?? ""
      );
    }}
    onChange={(event) => {
      const value = event.target.value;

      setOpenMedicineIndex(index);
      setMedicineSearch(value);

      const selectedMedicine =
        medicineList.find(
          (medicine) =>
            medicine.id ===
            items[index]?.medicineId
        );

      if (
        value !== selectedMedicine?.name
      ) {
        setValue(
          `items.${index}.medicineId`,
          ""
        );
      }
    }}
  />

  {openMedicineIndex === index && (
    <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-md border bg-white shadow-lg">
      {medicineList
        .filter((medicine) => {
          const search =
            medicineSearch
              .toLowerCase()
              .trim();

          if (!search) return true;

          return medicine.name
            .toLowerCase()
            .includes(search);
        })
        .map((medicine) => (
          <button
            key={medicine.id}
            type="button"
            className="flex w-full items-start px-3 py-2 text-left hover:bg-slate-100"
            onClick={() => {
              setValue(
                `items.${index}.medicineId`,
                medicine.id
              );

              setMedicineSearch(
                medicine.name
              );

              setOpenMedicineIndex(null);
            }}
          >
            <span className="font-medium">
              {medicine.name}
            </span>
          </button>
        ))}

      {medicineList.filter((medicine) => {
        const search =
          medicineSearch
            .toLowerCase()
            .trim();

        if (!search) return true;

        return medicine.name
          .toLowerCase()
          .includes(search);
      }).length === 0 && (
        <div className="px-3 py-3 text-sm text-muted-foreground">
          No medicines found.
        </div>
      )}
    </div>
  )}
</div>

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
  type="date"
  {...register(
    `items.${index}.manufacturingDate`
  )}
/>
            <Input
              placeholder="Rack"
              {...register(`items.${index}.rackLocation`)}
              />
            <div className="flex h-11 items-center rounded-md bg-slate-50 px-3 font-semibold">
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