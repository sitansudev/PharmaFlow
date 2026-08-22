import { z } from "zod";

export const purchaseItemSchema = z.object({
  medicineId: z
    .string()
    .cuid(),

  pack: z
    .string()
    .trim()
    .min(1, "Pack is required"),

  batchNo: z
    .string()
    .trim()
    .min(1, "Batch number is required")
    .transform((value) =>
      value.toUpperCase()
    ),

  expiryDate: z.coerce.date(),

  quantity: z
    .number()
    .int()
    .positive(),

  bonus: z
    .number()
    .int()
    .min(0)
    .default(0),

  rate: z
    .number()
    .positive(),

  discount: z
    .number()
    .min(0)
    .max(100)
    .default(0),
  ccCharge: z
    .number()
    .min(0)
    .default(0),
  mrp: z
    .number()
    .positive(),

  rackLocation: z
    .string()
    .trim()
    .optional(),
});

export const createPurchaseSchema = z
  .object({
    invoiceNo: z
      .string()
      .trim()
      .min(1, "Invoice number is required"),

    uniqueNumber: z
      .string()
      .trim()
      .optional(),

    supplierId: z
      .string()
      .cuid(),

    purchaseDate: z
      .coerce
      .date()
      .optional(),

    items: z
      .array(purchaseItemSchema)
      .min(
        1,
        "At least one medicine is required"
      ),
  })
  .superRefine((data, ctx) => {
    const batchNumbers = new Set<string>();

    data.items.forEach((item, index) => {
      if (item.expiryDate <= new Date()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Expiry date must be in the future.",
          path: [
            "items",
            index,
            "expiryDate",
          ],
        });
      }

      const batch =
        item.batchNo.toUpperCase();

      if (batchNumbers.has(batch)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Duplicate batch number in request.",
          path: [
            "items",
            index,
            "batchNo",
          ],
        });
      }

      batchNumbers.add(batch);
    });
  });

export type CreatePurchaseDTO =
  z.infer<typeof createPurchaseSchema>;