import { z } from "zod";

export const saleItemSchema = z.object({
  batchId: z.string().cuid(),

  quantity: z.coerce.number().int().positive(),
});

export const createSaleSchema = z.object({
  invoiceNo: z.string().min(1),

  customerId: z.string().cuid().optional(),

  items: z.array(saleItemSchema).min(1),
});

export type CreateSaleDTO = z.infer<typeof createSaleSchema>;