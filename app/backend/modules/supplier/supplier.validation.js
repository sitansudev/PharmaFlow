import { z } from "zod";
export const createSupplierSchema = z.object({
    name: z.string().min(2),
    email: z.string().email().optional(),
    phone: z.string().min(10),
    address: z.string().optional(),
    companyName: z.string().optional(),
});
export const updateSupplierSchema = createSupplierSchema.partial();
//# sourceMappingURL=supplier.validation.js.map