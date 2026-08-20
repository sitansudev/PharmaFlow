"use client";

import { useState } from "react";
import {
  useFieldArray,
  useForm,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useCreatePurchase } from "@/hooks/use-create-purchase";
import { useMedicines } from "@/hooks/use-medicines";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useCategories } from "@/hooks/use-categories";
import { useQuickCreateMedicine } from "@/hooks/use-quick-create-medicine";

import type { Medicine } from "@/types/medicine";

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

  purchaseDate: z.string(),

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
          .min(
            1,
            "Quantity must be at least 1"
          ),

        bonus: z
          .coerce
          .number()
          .int()
          .min(0),

        rate: z
          .coerce
          .number()
          .positive(
            "Rate must be greater than 0"
          ),

        discount: z
          .coerce
          .number()
          .min(0)
          .max(100),

        ccCharge: z
          .coerce
          .number()
          .min(0),

        mrp: z
          .coerce
          .number()
          .positive(
            "MRP must be greater than 0"
          ),

        batchNo: z
          .string()
          .min(
            1,
            "Batch number is required"
          ),

        expiryDate: z
          .string()
          .min(
            1,
            "Expiry date is required"
          ),

        rackLocation: z
          .string()
          .optional(),
      })
    )
    .min(
      1,
      "At least one medicine is required"
    ),
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

  const quickCreateMedicine =
    useQuickCreateMedicine();

  const { data: suppliers } =
    useSuppliers();

  const { data: medicines } =
    useMedicines();

  const { data: categories } =
    useCategories();

  const medicineList =
    medicines?.data ?? [];

  const [
    locallyCreatedMedicines,
    setLocallyCreatedMedicines,
  ] = useState<Medicine[]>([]);

  const availableMedicines = [
    ...medicineList,
    ...locallyCreatedMedicines.filter(
      (localMedicine) =>
        !medicineList.some(
          (medicine) =>
            medicine.id ===
            localMedicine.id
        )
    ),
  ];

  const [
    medicineSearch,
    setMedicineSearch,
  ] = useState("");

  const [
    openMedicineIndex,
    setOpenMedicineIndex,
  ] = useState<number | null>(null);

  const [
    showCreateMedicine,
    setShowCreateMedicine,
  ] = useState(false);

  const [
    createMedicineForIndex,
    setCreateMedicineForIndex,
  ] = useState<number | null>(null);

  const [
    newMedicineName,
    setNewMedicineName,
  ] = useState("");

  const [
    newMedicineGenericName,
    setNewMedicineGenericName,
  ] = useState("");

  const [
    newMedicineCategoryId,
    setNewMedicineCategoryId,
  ] = useState("");

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
          quantity: 0,
          bonus: 0,
          rate: 0,
          discount: 0,
          ccCharge: 0,
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

  const items = watch("items");

  function calculateNetRate(
    rate: number,
    discount: number
  ) {
    const discountAmount =
      (rate * discount) / 100;

    return Number(
      (
        rate - discountAmount
      ).toFixed(2)
    );
  }

  /*
   * Item total:
   *
   * Quantity × discounted rate
   * + CC Charge
   *
   * CC Charge is NOT discounted.
   */
  function calculateItemTotal(
    quantity: number,
    rate: number,
    discount: number,
    ccCharge: number
  ) {
    const netRate =
      calculateNetRate(
        rate,
        discount
      );

    const amountAfterDiscount =
      quantity * netRate;

    return Number(
      (
        amountAfterDiscount +
        ccCharge
      ).toFixed(2)
    );
  }

  /*
   * Grand total is the sum of every
   * medicine row total.
   */
  const grandTotal = items.reduce(
    (total, item) => {
      const quantity =
        Number(item.quantity) || 0;

      const rate =
        Number(item.rate) || 0;

      const discount =
        Number(item.discount) || 0;

      const ccCharge =
        Number(item.ccCharge) || 0;

      return (
        total +
        calculateItemTotal(
          quantity,
          rate,
          discount,
          ccCharge
        )
      );
    },
    0
  );

  const preRoundGrandTotal =
    Number(
      grandTotal.toFixed(2)
    );

  const finalGrandTotal =
    Math.floor(
      preRoundGrandTotal + 0.5
    );

  function openCreateMedicine(
    index: number
  ) {
    setCreateMedicineForIndex(
      index
    );

    setNewMedicineName(
      medicineSearch.trim()
    );

    setNewMedicineGenericName("");

    setNewMedicineCategoryId("");

    setShowCreateMedicine(true);

    setOpenMedicineIndex(null);
  }

  function closeCreateMedicine() {
    if (
      quickCreateMedicine.isPending
    ) {
      return;
    }

    setShowCreateMedicine(false);

    setCreateMedicineForIndex(
      null
    );

    setNewMedicineName("");

    setNewMedicineGenericName("");

    setNewMedicineCategoryId("");
  }

  async function handleQuickCreateMedicine() {
    const index =
      createMedicineForIndex;

    const name =
      newMedicineName.trim();

    const genericName =
      newMedicineGenericName.trim();

    if (!name) {
      toast.error(
        "Medicine name is required"
      );
      return;
    }

    if (name.length < 2) {
      toast.error(
        "Medicine name must be at least 2 characters"
      );
      return;
    }

    if (index === null) {
      toast.error(
        "Unable to determine purchase row"
      );
      return;
    }

    try {
      const response =
        await quickCreateMedicine.mutateAsync(
          {
            name,
            genericName:
              genericName ||
              undefined,
            categoryId:
              newMedicineCategoryId ||
              undefined,
            barcode: undefined,
          }
        );

      const createdMedicine =
        response.data;

      setLocallyCreatedMedicines(
        (current) => [
          ...current,
          createdMedicine,
        ]
      );

      setValue(
        `items.${index}.medicineId`,
        createdMedicine.id,
        {
          shouldValidate: true,
          shouldDirty: true,
        }
      );

      setMedicineSearch(
        createdMedicine.name
      );

      setOpenMedicineIndex(null);

      closeCreateMedicine();

      toast.success(
        `${createdMedicine.name} added successfully`
      );
    } catch (error: any) {
      console.error(
        "Quick medicine creation failed:",
        error
      );

      const message =
        error?.response?.data?.message ??
        "Failed to create medicine";

      toast.error(message);
    }
  }

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

      reset({
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
            quantity: 0,
            bonus: 0,
            rate: 0,
            discount: 0,
            ccCharge: 0,
            mrp: 0,
            batchNo: "",
            expiryDate: "",
            rackLocation: "",
          },
        ],
      });

      setMedicineSearch("");

      setOpenMedicineIndex(null);

      setLocallyCreatedMedicines([]);

      onSuccess?.();
    } catch (error: any) {
      console.error(
        "Purchase creation failed:",
        error
      );

      const message =
        error?.response?.data?.message ??
        "Failed to create purchase";

      toast.error(message);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8"
      >
        {/* PURCHASE INFORMATION */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

          {/* Supplier */}

          <div>
            <Label>
              Supplier *
            </Label>

            <select
              {...register("supplierId")}
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

          {/* Invoice */}

          <div>
            <Label>
              Invoice No *
            </Label>

            <Input
              {...register(
                "invoiceNo"
              )}
              placeholder="Invoice number"
            />

            {errors.invoiceNo && (
              <p className="mt-1 text-xs text-red-500">
                {
                  errors.invoiceNo
                    .message
                }
              </p>
            )}
          </div>

          {/* Unique Number */}

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

          {/* Purchase Date */}

          <div>
            <Label>
              Purchase Date
            </Label>

            <Input
              type="date"
              {...register(
                "purchaseDate"
              )}
            />
          </div>
        </div>

        {/* PURCHASE ITEMS */}

        <div className="overflow-x-auto rounded-xl border">
          <div className="min-w-[1850px]">

            {/* TABLE HEADER */}

            <div
              className="
                grid
                grid-cols-[2.7fr_1fr_0.8fr_0.8fr_1fr_1fr_1fr_1.1fr_1.1fr_1.1fr_1fr_1.1fr_0.8fr]
                gap-3
                border-b
                bg-muted
                p-4
                text-sm
                font-semibold
              "
            >
              <div>
                Medicine *
              </div>

              <div>
                Pack *
              </div>

              <div>
                Qty *
              </div>

              <div>
                Bonus
              </div>

              <div>
                Rate *
              </div>

              <div>
                Discount %
              </div>

              <div>
                CC Charge
              </div>

              <div>
                MRP *
              </div>

              <div>
                Batch No *
              </div>

              <div>
                Expiry *
              </div>

              <div>
                Rack
              </div>

              <div>
                Total
              </div>

              <div>
                Action
              </div>
            </div>

            {/* ITEMS */}

            {fields.map(
              (field, index) => {
                const selectedMedicine =
                  availableMedicines.find(
                    (medicine) =>
                      medicine.id ===
                      items[index]
                        ?.medicineId
                  );

                const quantity =
                  Number(
                    items[index]
                      ?.quantity
                  ) || 0;

                const rate =
                  Number(
                    items[index]?.rate
                  ) || 0;

                const discount =
                  Number(
                    items[index]
                      ?.discount
                  ) || 0;

                const ccCharge =
                  Number(
                    items[index]
                      ?.ccCharge
                  ) || 0;

                const itemTotal =
                  calculateItemTotal(
                    quantity,
                    rate,
                    discount,
                    ccCharge
                  );

                const searchResults =
                  availableMedicines.filter(
                    (medicine) => {
                      const search =
                        medicineSearch
                          .toLowerCase()
                          .trim();

                      if (!search) {
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
                  );

                return (
                  <div
                    key={field.id}
                    className="
                      grid
                      grid-cols-[2.7fr_1fr_0.8fr_0.8fr_1fr_1fr_1fr_1.1fr_1.1fr_1.1fr_1fr_1.1fr_0.8fr]
                      items-start
                      gap-3
                      border-b
                      p-4
                    "
                  >

                    {/* MEDICINE */}

                    <div className="relative">
                      <Label className="mb-1 block">
                        Medicine *
                      </Label>

                      <div className="flex gap-2">

                        <div className="relative min-w-0 flex-1">
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
                                  ?.name ??
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

                              setValue(
                                `items.${index}.medicineId`,
                                "",
                                {
                                  shouldValidate:
                                    false,
                                  shouldDirty:
                                    true,
                                }
                              );
                            }}
                          />

                          {openMedicineIndex ===
                            index && (
                            <div
                              className="
                                absolute
                                left-0
                                right-0
                                top-full
                                z-[80]
                                mt-1
                                max-h-64
                                overflow-y-auto
                                rounded-md
                                border
                                bg-white
                                shadow-lg
                              "
                            >
                              {searchResults.map(
                                (
                                  medicine
                                ) => (
                                  <button
                                    key={
                                      medicine.id
                                    }
                                    type="button"
                                    className="
                                      flex
                                      w-full
                                      items-start
                                      px-3
                                      py-2
                                      text-left
                                      hover:bg-slate-100
                                    "
                                    onClick={() => {
                                      setValue(
                                        `items.${index}.medicineId`,
                                        medicine.id,
                                        {
                                          shouldValidate:
                                            true,
                                          shouldDirty:
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
                                    <div className="min-w-0">
                                      <div className="truncate font-medium">
                                        {
                                          medicine.name
                                        }
                                      </div>

                                      {medicine.genericName && (
                                        <div className="truncate text-xs text-muted-foreground">
                                          {
                                            medicine.genericName
                                          }
                                        </div>
                                      )}
                                    </div>
                                  </button>
                                )
                              )}

                              {searchResults.length ===
                                0 && (
                                <div className="px-3 py-4 text-sm text-muted-foreground">
                                  No medicines found.
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 w-11 shrink-0 px-0 text-lg font-semibold"
                          title="Add new medicine"
                          onClick={() =>
                            openCreateMedicine(
                              index
                            )
                          }
                        >
                          +
                        </Button>
                      </div>

                      {errors.items?.[
                        index
                      ]?.medicineId && (
                        <p className="mt-1 text-xs text-red-500">
                          Medicine required
                        </p>
                      )}
                    </div>

                    {/* PACK */}

                    <div>
                      <Label className="mb-1 block">
                        Pack *
                      </Label>

                      <Input
                        placeholder="Strip / Bottle / Box"
                        {...register(
                          `items.${index}.pack`
                        )}
                      />

                      {errors.items?.[
                        index
                      ]?.pack && (
                        <p className="mt-1 text-xs text-red-500">
                          {
                            errors.items[
                              index
                            ]?.pack?.message
                          }
                        </p>
                      )}
                    </div>

                    {/* QUANTITY */}

                    <div>
                      <Label className="mb-1 block">
                        Qty *
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        {...register(
                          `items.${index}.quantity`
                        )}
                      />

                      {errors.items?.[
                        index
                      ]?.quantity && (
                        <p className="mt-1 text-xs text-red-500">
                          {
                            errors.items[
                              index
                            ]?.quantity?.message
                          }
                        </p>
                      )}
                    </div>

                    {/* BONUS */}

                    <div>
                      <Label className="mb-1 block">
                        Bonus
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        {...register(
                          `items.${index}.bonus`
                        )}
                      />
                    </div>

                    {/* RATE */}

                    <div>
                      <Label className="mb-1 block">
                        Rate *
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...register(
                          `items.${index}.rate`
                        )}
                      />

                      {errors.items?.[
                        index
                      ]?.rate && (
                        <p className="mt-1 text-xs text-red-500">
                          {
                            errors.items[
                              index
                            ]?.rate?.message
                          }
                        </p>
                      )}
                    </div>

                    {/* DISCOUNT */}

                    <div>
                      <Label className="mb-1 block">
                        Disc. %
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        {...register(
                          `items.${index}.discount`
                        )}
                      />
                    </div>

                    {/* CC CHARGE */}

                    <div>
                      <Label className="mb-1 block">
                        CC Charge
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...register(
                          `items.${index}.ccCharge`
                        )}
                      />

                      {errors.items?.[
                        index
                      ]?.ccCharge && (
                        <p className="mt-1 text-xs text-red-500">
                          {
                            errors.items[
                              index
                            ]?.ccCharge?.message
                          }
                        </p>
                      )}
                    </div>

                    {/* MRP */}

                    <div>
                      <Label className="mb-1 block">
                        MRP *
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...register(
                          `items.${index}.mrp`
                        )}
                      />

                      {errors.items?.[
                        index
                      ]?.mrp && (
                        <p className="mt-1 text-xs text-red-500">
                          {
                            errors.items[
                              index
                            ]?.mrp?.message
                          }
                        </p>
                      )}
                    </div>

                    {/* BATCH */}

                    <div>
                      <Label className="mb-1 block">
                        Batch *
                      </Label>

                      <Input
                        placeholder="Batch"
                        {...register(
                          `items.${index}.batchNo`
                        )}
                      />

                      {errors.items?.[
                        index
                      ]?.batchNo && (
                        <p className="mt-1 text-xs text-red-500">
                          {
                            errors.items[
                              index
                            ]?.batchNo?.message
                          }
                        </p>
                      )}
                    </div>

                    {/* EXPIRY */}

                    <div>
                      <Label className="mb-1 block">
                        Expiry *
                      </Label>

                      <Input
                        type="date"
                        {...register(
                          `items.${index}.expiryDate`
                        )}
                      />

                      {errors.items?.[
                        index
                      ]?.expiryDate && (
                        <p className="mt-1 text-xs text-red-500">
                          {
                            errors.items[
                              index
                            ]?.expiryDate?.message
                          }
                        </p>
                      )}
                    </div>

                    {/* RACK */}

                    <div>
                      <Label className="mb-1 block">
                        Rack
                      </Label>

                      <Input
                        placeholder="Rack"
                        {...register(
                          `items.${index}.rackLocation`
                        )}
                      />
                    </div>

                    {/* TOTAL */}

                    <div>
                      <Label className="mb-1 block">
                        Total
                      </Label>

                      <div className="rounded-md bg-slate-50 px-3 py-2.5 text-right font-semibold">
                        ₹
                        {itemTotal.toFixed(
                          2
                        )}
                      </div>
                    </div>

                    {/* ACTION */}

                    <div>
                      <Label className="mb-1 block">
                        Action
                      </Label>

                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() =>
                          remove(index)
                        }
                        disabled={
                          fields.length ===
                          1
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* ADD MEDICINE + GRAND TOTAL */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                medicineId: "",
                pack: "",
                quantity: 0,
                bonus: 0,
                rate: 0,
                discount: 0,
                ccCharge: 0,
                mrp: 0,
                batchNo: "",
                expiryDate: "",
                rackLocation: "",
              })
            }
          >
            + Add Medicine
          </Button>

          <div className="rounded-xl border bg-white px-6 py-4 text-right shadow-sm">
            <div className="text-sm font-medium text-muted-foreground">
              Items Total
            </div>

            <div className="text-lg font-semibold">
              ₹{grandTotal.toFixed(2)}
            </div>

            <div className="mt-2 border-t pt-2 text-xl font-bold">
              Grand Total: ₹
              {finalGrandTotal.toFixed(2)}
            </div>
          </div>
        </div>

        {/* SUBMIT */}

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

      {/* QUICK CREATE MEDICINE MODAL */}

      {showCreateMedicine && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border bg-white shadow-xl">

            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold">
                Add New Medicine
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Create the medicine first.
                Purchase details will be
                entered below.
              </p>
            </div>

            <div className="space-y-5 p-6">

              <div className="space-y-2">
                <Label>
                  Medicine Name *
                </Label>

                <Input
                  autoFocus
                  value={
                    newMedicineName
                  }
                  onChange={(event) =>
                    setNewMedicineName(
                      event.target
                        .value
                    )
                  }
                  placeholder="e.g. Paracetamol 500mg"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Generic Name
                </Label>

                <Input
                  value={
                    newMedicineGenericName
                  }
                  onChange={(event) =>
                    setNewMedicineGenericName(
                      event.target
                        .value
                    )
                  }
                  placeholder="e.g. Paracetamol"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Category
                </Label>

                <select
                  value={
                    newMedicineCategoryId
                  }
                  onChange={(event) =>
                    setNewMedicineCategoryId(
                      event.target
                        .value
                    )
                  }
                  className="
                    h-10
                    w-full
                    rounded-md
                    border
                    bg-background
                    px-3
                    text-sm
                  "
                >
                  <option value="">
                    Select Category
                  </option>

                  {categories?.data.map(
                    (category) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-4">

              <Button
                type="button"
                variant="outline"
                onClick={
                  closeCreateMedicine
                }
                disabled={
                  quickCreateMedicine.isPending
                }
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={
                  handleQuickCreateMedicine
                }
                disabled={
                  quickCreateMedicine.isPending
                }
              >
                {quickCreateMedicine.isPending
                  ? "Creating..."
                  : "Create Medicine"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}