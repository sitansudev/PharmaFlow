import { z } from "zod";

export const createMedicineSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Medicine name must be at least 2 characters"),

  genericName: z
    .string()
    .trim()
    .optional(),

  supplierId: z
    .string()
    .cuid("Supplier is required"),

  categoryId: z
    .string()
    .cuid()
    .optional(),

  batchNo: z
    .string()
    .trim()
    .min(1, "Batch number is required"),

  purchasePrice: z.coerce
    .number()
    .positive("Purchase price must be greater than 0"),

  sellingPrice: z.coerce
    .number()
    .positive("Selling price must be greater than 0"),

  stock: z.coerce
    .number()
    .int()
    .min(0),

  minimumStock: z.coerce
    .number()
    .int()
    .min(0)
    .default(10),

  unit: z
    .string()
    .trim()
    .min(1, "Unit is required"),

  expiryDate: z.coerce.date(),

  manufacturingDate: z.coerce
    .date()
    .optional(),

  rackLocation: z
    .string()
    .trim()
    .optional(),

  barcode: z
    .string()
    .trim()
    .optional(),
});

export const updateMedicineSchema =
  createMedicineSchema.partial();

export type CreateMedicineDTO = z.infer<
  typeof createMedicineSchema
>;

export type UpdateMedicineDTO = z.infer<
  typeof updateMedicineSchema
>;