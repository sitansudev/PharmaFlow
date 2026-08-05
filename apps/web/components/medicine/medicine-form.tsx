"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateMedicine } from "@/hooks/use-create-medicine";
import { useCategories } from "@/hooks/use-categories";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useEffect } from "react";
import { useUpdateMedicine } from "@/hooks/use-update-medicine";
import type { Medicine } from "@/types/medicine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().min(2, "Medicine name is required"),

  genericName: z.string().optional(),

  supplierId: z.string().min(1, "Supplier is required"),

  categoryId: z.string().optional(),

  batchNo: z.string().min(1, "Batch number is required"),

  purchasePrice: z.coerce.number().positive(),

  sellingPrice: z.coerce.number().positive(),

  stock: z.coerce.number().min(0),

  unit: z.string().min(1, "Unit is required"),

  expiryDate: z.string().min(1, "Expiry date is required"),
});

type FormInput = z.input<typeof schema>;
type FormData = z.output<typeof schema>;

interface MedicineFormProps {
  medicine?: Medicine;
  onSuccess?: () => void;
}

export function MedicineForm({
  medicine,
  onSuccess,
}: MedicineFormProps) {
  const createMedicine = useCreateMedicine();
  const updateMedicine = useUpdateMedicine();
  const { data: suppliers } = useSuppliers();
  const { data: categories } = useCategories();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, any, FormData>({
    resolver: zodResolver(schema),

    defaultValues: {
      stock: 0,
      supplierId: "",
      categoryId: "",
    },
  });
  useEffect(() => {
  if (!medicine) return;

  const latestBatch = medicine.batches?.[0];

  reset({
    name: medicine.name,

    genericName: medicine.genericName ?? "",

    supplierId: latestBatch?.supplier?.id ?? "",

    categoryId: medicine.category?.id ?? "",

    batchNo: latestBatch?.batchNo ?? "",

    purchasePrice: Number(
      latestBatch?.purchasePrice ?? 0
    ),

    sellingPrice: Number(medicine.sellingPrice),

    stock: medicine.stock,

    unit: medicine.unit,

    expiryDate: latestBatch?.expiryDate
      ? new Date(latestBatch.expiryDate)
          .toISOString()
          .split("T")[0]
      : "",
  });
}, [medicine, reset]);

  async function onSubmit(values: FormData) {
  if (medicine) {
  await updateMedicine.mutateAsync({
    id: medicine.id,
    data: values,
  });

  onSuccess?.();

  return;
}else {
    await createMedicine.mutateAsync(values);

    reset({
    name: "",
    genericName: "",
    supplierId: "",
    categoryId: "",
    batchNo: "",
    purchasePrice: 0,
    sellingPrice: 0,
    stock: 0,
    unit: "",
    expiryDate: "",
    });
  }

  onSuccess?.();
}

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <div className="grid grid-cols-2 gap-4">

        <div>
          <Label>Medicine Name</Label>

          <Input {...register("name")} />

          <p className="mt-1 text-xs text-red-500">
            {errors.name?.message}
          </p>
        </div>

        <div>
          <Label>Generic Name</Label>

          <Input {...register("genericName")} />
        </div>

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

          <p className="mt-1 text-xs text-red-500">
            {errors.supplierId?.message}
          </p>
        </div>

        <div>
          <Label>Category</Label>

          <select
            {...register("categoryId")}
            className="h-10 w-full rounded-md border px-3"
          >
            <option value="">
              Select Category
            </option>

            {categories?.data.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Batch Number</Label>

          <Input {...register("batchNo")} />

          <p className="mt-1 text-xs text-red-500">
            {errors.batchNo?.message}
          </p>
        </div>

        <div>
          <Label>Purchase Price</Label>

          <Input
            type="number"
            step="0.01"
            {...register("purchasePrice")}
          />
        </div>

        <div>
          <Label>Selling Price</Label>

          <Input
            type="number"
            step="0.01"
            {...register("sellingPrice")}
          />
        </div>

        <div>
          <Label>Stock</Label>

          <Input
            type="number"
            {...register("stock")}
          />
        </div>

        <div>
          <Label>Unit</Label>

          <Input
            {...register("unit")}
          />
        </div>

        <div className="col-span-2">
          <Label>Expiry Date</Label>

          <Input
            type="date"
            {...register("expiryDate")}
          />
        </div>

      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={
          createMedicine.isPending ||
           updateMedicine.isPending
            }
            >
          {medicine ? "Update Medicine" : "Save Medicine"}
        </Button>
      </div>
    </form>
  );
}