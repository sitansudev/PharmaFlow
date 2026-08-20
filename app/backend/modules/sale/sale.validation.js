import { z } from "zod";
export const saleItemSchema = z.object({
    batchId: z.string().cuid(),
    quantity: z
        .coerce
        .number()
        .int()
        .positive(),
});
export const createSaleSchema = z.object({
    invoiceNo: z
        .string()
        .trim()
        .min(1),
    customerId: z
        .string()
        .cuid()
        .optional(),
    paymentMethod: z.enum([
        "CASH",
        "ESEWA",
        "FONEPAY",
    ]),
    /*
     * Optional percentage discount.
     *
     * If omitted, discount = 0%.
     */
    discountPercent: z
        .coerce
        .number()
        .min(0)
        .max(100)
        .default(0),
    items: z
        .array(saleItemSchema)
        .min(1),
});
//# sourceMappingURL=sale.validation.js.map