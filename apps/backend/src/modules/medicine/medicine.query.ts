import { z } from "zod";

export const medicineQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),

  search: z.string().trim().optional(),

  sort: z.enum([
  "name",
  "genericName",
  "brand",
  "stock",
  "createdAt",
]).optional(),

  order: z.enum(["asc", "desc"]).optional(),

  categoryId: z.string().cuid().optional(),

  inStock: z.coerce.boolean().optional(),

  lowStock: z.coerce.boolean().optional(),

  expired: z.coerce.boolean().optional(),
});

export type MedicineQuery = z.infer<typeof medicineQuerySchema>;