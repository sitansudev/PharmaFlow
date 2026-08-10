import { z } from "zod";

export const purchaseItemSchema = z.object({
  medicineId: z.string().cuid(),

  batchNo: z
  .string()
  .trim()
  .min(1, "Batch number is required")
  .transform((value) => value.toUpperCase()),

  manufacturingDate: z.coerce.date().optional(),

  expiryDate: z.coerce.date(),

  quantity: z
    .number()
    .int()
    .positive(),

  purchasePrice: z
    .number()
    .positive(),

  rackLocation: z
    .string()
    .trim()
    .optional(),
});

export const createPurchaseSchema = z.object({
  invoiceNo: z
    .string()
    .trim()
    .min(1),

  supplierId: z.string().cuid(),

  purchaseDate: z.coerce.date().optional(),

  items: z
    .array(purchaseItemSchema)
    .min(1),

}).superRefine((data, ctx) => {
  const batchNumbers = new Set<string>();

  data.items.forEach((item, index) => {
    if (item.expiryDate <= new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Expiry date must be in the future.",
        path: ["items", index, "expiryDate"],
      });
    }

    if (
      item.manufacturingDate &&
      item.manufacturingDate >= item.expiryDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Manufacturing date must be before expiry date.",
        path: ["items", index, "manufacturingDate"],
      });
    }

    const batch = item.batchNo.toUpperCase();

    if (batchNumbers.has(item.batchNo)) {
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message:
      "Duplicate batch number in request.",
    path: ["items", index, "batchNo"],
  });
}

batchNumbers.add(item.batchNo);
  });
});

export type CreatePurchaseDTO = z.infer<
  typeof createPurchaseSchema
>;