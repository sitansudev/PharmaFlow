import { supplierService } from "./supplier.service.js";
import { createSupplierSchema, updateSupplierSchema, } from "./supplier.validation.js";
export class SupplierController {
    async create(req, res) {
        const data = createSupplierSchema.parse(req.body);
        const supplier = await supplierService.create(data);
        return res.status(201).json({
            success: true,
            message: "Supplier created successfully",
            data: supplier,
        });
    }
    async findAll(_req, res) {
        const suppliers = await supplierService.findAll();
        return res.json({
            success: true,
            data: suppliers,
        });
    }
    async findById(req, res) {
        const supplier = await supplierService.findById(req.params.id);
        return res.json({
            success: true,
            data: supplier,
        });
    }
    async update(req, res) {
        const data = updateSupplierSchema.parse(req.body);
        const supplier = await supplierService.update(req.params.id, data);
        return res.json({
            success: true,
            message: "Supplier updated successfully",
            data: supplier,
        });
    }
    async delete(req, res) {
        await supplierService.delete(req.params.id);
        return res.json({
            success: true,
            message: "Supplier deleted successfully",
        });
    }
}
export const supplierController = new SupplierController();
//# sourceMappingURL=supplier.controller.js.map