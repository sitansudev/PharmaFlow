import { z } from "zod";

export const supplierPaymentSchema = z.object({
  date: z.coerce.date().optional(),

  uniqueNumber: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal("")),

  invoiceNumber: z
    .string()
    .trim()
    .min(1, "Bill number is required")
    .max(100),

  amount: z
    .number()
    .positive("Payment amount must be greater than zero"),

  paymentMethod: z.enum([
    "CASH",
    "UPI",
    "CARD",
    "ESEWA",
    "FONEPAY",
  ]),

  notes: z
    .string()
    .trim()
    .max(500)
    .optional(),
});

export type SupplierPaymentDTO = z.infer<
  typeof supplierPaymentSchema
>;