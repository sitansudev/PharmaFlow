import { z } from "zod";

export const createSupplierSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().min(10),
  address: z.string().optional(),
  panNo: z.string().optional(),
});

export const updateSupplierSchema =
  createSupplierSchema.partial();

export type CreateSupplierDTO =
  z.infer<typeof createSupplierSchema>;

export type UpdateSupplierDTO =
  z.infer<typeof updateSupplierSchema>;