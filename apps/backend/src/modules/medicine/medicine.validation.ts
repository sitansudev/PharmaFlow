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

  sellingPrice: z.coerce
    .number()
    .positive("Selling price must be greater than 0"),

  unit: z
    .string()
    .trim()
    .min(1, "Unit is required"),

  minimumStock: z.coerce
    .number()
    .int()
    .min(0)
    .default(10),

  categoryId: z
    .string()
    .cuid()
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