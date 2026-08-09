import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(2),

  phone: z.string().optional(),

  email: z.string().email().optional(),

  address: z.string().optional(),

  dueAmount: z
    .string()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      "Invalid due amount"
    )
    .optional()
    .default("0"),
});

export const updateCustomerSchema =
  createCustomerSchema.partial();

export type CreateCustomerDTO =
  z.infer<typeof createCustomerSchema>;

export type UpdateCustomerDTO =
  z.infer<typeof updateCustomerSchema>;

  export const recordPaymentSchema = z.object({
  amount: z
    .string()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      "Invalid payment amount"
    ),
});

export type RecordPaymentDTO =
  z.infer<typeof recordPaymentSchema>;