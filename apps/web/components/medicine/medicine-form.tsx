"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateMedicine } from "@/hooks/use-create-medicine";
import { useUpdateMedicine } from "@/hooks/use-update-medicine";
import { useCategories } from "@/hooks/use-categories";
import { useSuppliers } from "@/hooks/use-suppliers";

import type { Medicine } from "@/types/medicine";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z
    .string()
    .min(2, "Medicine name is required"),

  genericName: z
    .string()
    .optional(),

  supplierId: z
    .string()
    .min(1, "Supplier is required"),

  categoryId: z
    .string()
    .optional(),

  batchNo: z
    .string()
    .min(1, "Batch number is required"),

  pack: z
    .string()
    .min(1, "Pack is required"),

  bonus: z.coerce
    .number()
    .int()
    .min(0)
    .default(0),

  /*
   * Rate = purchase rate for this batch.
   */
  rate: z.coerce
    .number()
    .positive(
      "Rate must be greater than 0"
    ),

  /*
   * Supplier discount percentage.
   */
  discount: z.coerce
    .number()
    .min(0)
    .max(100),

  /*
   * MRP belongs to the batch.
   */
  mrp: z.coerce
    .number()
    .positive(
      "MRP must be greater than 0"
    ),

  /*
   * Current physical stock.
   */
  stock: z.coerce
    .number()
    .int()
    .min(0),

  minimumStock: z.coerce
    .number()
    .int()
    .min(0),

  expiryDate: z
    .string()
    .min(
      1,
      "Expiry date is required"
    ),

  rackLocation: z
    .string()
    .optional(),

  barcode: z
    .string()
    .optional(),
});

type FormInput = z.input<
  typeof schema
>;

type FormData = z.output<
  typeof schema
>;

interface MedicineFormProps {
  medicine?: Medicine;
  onSuccess?: () => void;
}

export function MedicineForm({
  medicine,
  onSuccess,
}: MedicineFormProps) {
  const createMedicine =
    useCreateMedicine();

  const updateMedicine =
    useUpdateMedicine();

  const { data: suppliers } =
    useSuppliers();

  const { data: categories } =
    useCategories();

  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<
    FormInput,
    any,
    FormData
  >({
    resolver:
      zodResolver(schema),

    defaultValues: {
      name: "",
      genericName: "",

      supplierId: "",
      categoryId: "",

      batchNo: "",
      pack: "",

      bonus: 0,

      rate: 0,
      discount: 0,
      mrp: 0,

      stock: 0,
      minimumStock: 10,

      expiryDate: "",

      rackLocation: "",
      barcode: "",
    },
  });

  /*
   * Populate form while editing.
   *
   * Commercial values come from
   * the latest batch.
   */
  useEffect(() => {
    if (!medicine) {
      return;
    }

    const latestBatch =
      medicine.batches?.[0];

    reset({
      name: medicine.name,

      genericName:
        medicine.genericName ?? "",

      supplierId:
        latestBatch?.supplier?.id ??
        "",

      categoryId:
        medicine.category?.id ?? "",

      batchNo:
        latestBatch?.batchNo ?? "",

      pack:
        latestBatch?.pack ?? "",

      bonus:
        latestBatch?.bonus ?? 0,

      /*
       * Rate belongs to
       * MedicineBatch.
       */
      rate: Number(
        latestBatch?.rate ?? 0
      ),

      /*
       * Discount belongs to
       * MedicineBatch.
       */
      discount: Number(
        latestBatch?.discount ?? 0
      ),

      /*
       * MRP belongs to
       * MedicineBatch.
       */
      mrp: Number(
        latestBatch?.mrp ?? 0
      ),

      /*
       * Medicine stock is the
       * current aggregate stock.
       */
      stock: medicine.stock,

      minimumStock:
        medicine.minimumStock,

      expiryDate:
        latestBatch?.expiryDate
          ? new Date(
              latestBatch.expiryDate
            )
              .toISOString()
              .split("T")[0]
          : "",

      rackLocation:
        latestBatch?.rackLocation ??
        "",

      barcode:
        medicine.barcode ?? "",
    });
  }, [medicine, reset]);

  async function onSubmit(
    values: FormData
  ) {
    try {
      /*
       * Convert optional empty strings
       * to undefined.
       */
      const payload = {
        ...values,

        genericName:
          values.genericName?.trim() ||
          undefined,

        categoryId:
          values.categoryId?.trim() ||
          undefined,

        rackLocation:
          values.rackLocation?.trim() ||
          undefined,

        barcode:
          values.barcode?.trim() ||
          undefined,
      };

      if (medicine) {
        await updateMedicine.mutateAsync({
          id: medicine.id,
          data: payload,
        });
      } else {
        await createMedicine.mutateAsync(
          payload
        );

        reset({
          name: "",
          genericName: "",

          supplierId: "",
          categoryId: "",

          batchNo: "",
          pack: "",

          bonus: 0,

          rate: 0,
          discount: 0,
          mrp: 0,

          stock: 0,
          minimumStock: 10,

          expiryDate: "",

          rackLocation: "",
          barcode: "",
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error(
        "Medicine save failed:",
        error
      );
    }
  }

  const isSaving =
    createMedicine.isPending ||
    updateMedicine.isPending ||
    isSubmitting;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="grid grid-cols-2 gap-4">

        {/* Medicine Name */}

        <div>
          <Label>
            Medicine Name *
          </Label>

          <Input
            {...register("name")}
            placeholder="Medicine name"
          />

          {errors.name && (
            <p className="mt-1 text-xs text-red-500">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Generic Name */}

        <div>
          <Label>
            Generic Name
          </Label>

          <Input
            {...register(
              "genericName"
            )}
            placeholder="Generic name"
          />

          {errors.genericName && (
            <p className="mt-1 text-xs text-red-500">
              {
                errors.genericName
                  .message
              }
            </p>
          )}
        </div>

        {/* Supplier */}

        <div>
          <Label>
            Supplier *
          </Label>

          <select
            {...register(
              "supplierId"
            )}
            className="h-10 w-full rounded-md border bg-background px-3"
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
            <p className="mt-1 text-xs text-red-500">
              {
                errors.supplierId
                  .message
              }
            </p>
          )}
        </div>

        {/* Category */}

        <div>
          <Label>
            Category
          </Label>

          <select
            {...register(
              "categoryId"
            )}
            className="h-10 w-full rounded-md border bg-background px-3"
          >
            <option value="">
              Select Category
            </option>

            {categories?.data.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              )
            )}
          </select>

          {errors.categoryId && (
            <p className="mt-1 text-xs text-red-500">
              {
                errors.categoryId
                  .message
              }
            </p>
          )}
        </div>

        {/* Pack */}

        <div>
          <Label>
            Pack *
          </Label>

          <Input
            {...register("pack")}
            placeholder="e.g. 10 TAB / 10 STRIP / 100 ML"
          />

          {errors.pack && (
            <p className="mt-1 text-xs text-red-500">
              {errors.pack.message}
            </p>
          )}

          <p className="mt-1 text-xs text-muted-foreground">
            Defines the package, such as
            10 TAB, 10 STRIP, 100 ML, 1 VIAL.
          </p>
        </div>

        {/* Batch Number */}

        <div>
          <Label>
            Batch Number *
          </Label>

          <Input
            {...register(
              "batchNo"
            )}
            placeholder="Batch number"
          />

          {errors.batchNo && (
            <p className="mt-1 text-xs text-red-500">
              {
                errors.batchNo
                  .message
              }
            </p>
          )}
        </div>

        {/* Expiry */}

        <div>
          <Label>
            Expiry Date *
          </Label>

          <Input
            type="date"
            {...register(
              "expiryDate"
            )}
          />

          {errors.expiryDate && (
            <p className="mt-1 text-xs text-red-500">
              {
                errors.expiryDate
                  .message
              }
            </p>
          )}
        </div>

        {/* Current Stock */}

        <div>
          <Label>
            Current Stock
          </Label>

          <Input
            type="number"
            min="0"
            {...register("stock")}
          />

          {errors.stock && (
            <p className="mt-1 text-xs text-red-500">
              {errors.stock.message}
            </p>
          )}

          <p className="mt-1 text-xs text-muted-foreground">
            Total quantity currently
            available.
          </p>
        </div>

        {/* Rate */}

        <div>
          <Label>
            Rate *
          </Label>

          <Input
            type="number"
            min="0"
            step="0.01"
            {...register("rate")}
          />

          {errors.rate && (
            <p className="mt-1 text-xs text-red-500">
              {errors.rate.message}
            </p>
          )}

          <p className="mt-1 text-xs text-muted-foreground">
            Purchase rate for this batch.
          </p>
        </div>

        {/* Discount */}

        <div>
          <Label>
            Supplier Discount %
          </Label>

          <Input
            type="number"
            min="0"
            max="100"
            step="0.01"
            {...register(
              "discount"
            )}
          />

          {errors.discount && (
            <p className="mt-1 text-xs text-red-500">
              {
                errors.discount
                  .message
              }
            </p>
          )}
        </div>

        {/* MRP */}

        <div>
          <Label>
            MRP *
          </Label>

          <Input
            type="number"
            min="0"
            step="0.01"
            {...register("mrp")}
          />

          {errors.mrp && (
            <p className="mt-1 text-xs text-red-500">
              {errors.mrp.message}
            </p>
          )}

          <p className="mt-1 text-xs text-muted-foreground">
            Maximum retail price for
            this batch.
          </p>
        </div>

        {/* Minimum Stock */}

        <div>
          <Label>
            Minimum Stock
          </Label>

          <Input
            type="number"
            min="0"
            {...register(
              "minimumStock"
            )}
          />

          {errors.minimumStock && (
            <p className="mt-1 text-xs text-red-500">
              {
                errors.minimumStock
                  .message
              }
            </p>
          )}
        </div>

        {/* Rack Location */}

        <div>
          <Label>
            Rack Location
          </Label>

          <Input
            {...register(
              "rackLocation"
            )}
            placeholder="e.g. R1"
          />

          {errors.rackLocation && (
            <p className="mt-1 text-xs text-red-500">
              {
                errors.rackLocation
                  .message
              }
            </p>
          )}
        </div>

        {/* Barcode */}

        <div>
          <Label>
            Barcode
          </Label>

          <Input
            {...register("barcode")}
            placeholder="Optional barcode"
          />

          {errors.barcode && (
            <p className="mt-1 text-xs text-red-500">
              {
                errors.barcode
                  .message
              }
            </p>
          )}
        </div>
      </div>

      {/* Hidden bonus */}

      <input
        type="hidden"
        {...register("bonus")}
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSaving}
        >
          {isSaving
            ? "Saving..."
            : medicine
              ? "Update Medicine"
              : "Save Medicine"}
        </Button>
      </div>
    </form>
  );
}