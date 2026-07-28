import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
});

export const updateCustomerSchema =
  createCustomerSchema.partial();

export type CreateCustomerDTO =
  z.infer<typeof createCustomerSchema>;

export type UpdateCustomerDTO =
  z.infer<typeof updateCustomerSchema>;