import { z } from "zod";

export const purchaseItemSchema = z.object({
  medicineId: z.string().cuid(),
  quantity: z.number().int().positive(),
  purchasePrice: z.number().positive(),
});

export const createPurchaseSchema = z.object({
  invoiceNo: z.string().min(1),
  supplierId: z.string().cuid(),
  purchaseDate: z.coerce.date().optional(),
  items: z.array(purchaseItemSchema).min(1),
});

export type CreatePurchaseDTO = z.infer<typeof createPurchaseSchema>;