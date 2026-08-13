import { z } from "zod";

const optionalCuid = z.preprocess(
  (value) =>
    value === "" || value === null
      ? undefined
      : value,
  z.string().cuid().optional()
);

const optionalString = z.preprocess(
  (value) =>
    value === "" || value === null
      ? undefined
      : value,
  z.string().trim().optional()
);

export const createMedicineSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Medicine name must be at least 2 characters"),

  genericName: optionalString,

  supplierId: z
    .string()
    .cuid("Supplier is required"),

  categoryId: optionalCuid,

  batchNo: z
    .string()
    .trim()
    .min(1, "Batch number is required"),

  pack: z
    .string()
    .trim()
    .min(1, "Pack is required"),

  bonus: z.coerce
    .number()
    .int()
    .min(0)
    .default(0),

  rate: z.coerce
    .number()
    .positive("Rate must be greater than 0"),

  discount: z.coerce
    .number()
    .min(0)
    .max(100)
    .default(0),


  mrp: z.coerce
    .number()
    .positive("MRP must be greater than 0"),

  stock: z.coerce
    .number()
    .int()
    .min(0),

  minimumStock: z.coerce
    .number()
    .int()
    .min(0)
    .default(10),



  expiryDate: z.coerce.date(),

  rackLocation: optionalString,

  barcode: optionalString,
});
export const quickCreateMedicineSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      2,
      "Medicine name must be at least 2 characters"
    ),

  genericName: optionalString,

  categoryId: optionalCuid,
  barcode: optionalString,
});

export type QuickCreateMedicineDTO =
  z.infer<typeof quickCreateMedicineSchema>;
export const updateMedicineSchema =
  createMedicineSchema.partial();

export type CreateMedicineDTO =
  z.infer<typeof createMedicineSchema>;

export type UpdateMedicineDTO =
  z.infer<typeof updateMedicineSchema>;