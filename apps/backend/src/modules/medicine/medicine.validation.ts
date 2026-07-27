import { z } from "zod";

export const createMedicineSchema = z.object({
  name: z
    .string()
    .min(2, "Medicine name must be at least 2 characters"),

  genericName: z
    .string()
    .optional(),

  brand: z
    .string()
    .optional(),

  batchNo: z
    .string()
    .min(1, "Batch number is required"),

  expiryDate: z.coerce.date(),

  purchasePrice: z.coerce.number().positive(),

  sellingPrice: z.coerce.number().positive(),

  stock: z.coerce.number().int().min(0),
  categoryId: z.string().cuid().optional(),
  unit: z
    .string()
    .min(1, "Unit is required"),
});

export const updateMedicineSchema = createMedicineSchema.partial();

export type CreateMedicineDTO = z.infer<typeof createMedicineSchema>;
export type UpdateMedicineDTO = z.infer<typeof updateMedicineSchema>;