import { medicineService } from "./medicine.service.js";
import { createMedicineSchema, updateMedicineSchema, quickCreateMedicineSchema, } from "./medicine.validation.js";
import { medicineQuerySchema } from "./medicine.query.js";
export class MedicineController {
    async create(req, res, next) {
        try {
            const data = createMedicineSchema.parse(req.body);
            const medicine = await medicineService.create(data);
            res.status(201).json({
                success: true,
                message: "Medicine created successfully",
                data: medicine,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async findAll(req, res, next) {
        try {
            const query = medicineQuerySchema.parse(req.query);
            const result = await medicineService.findAll(query);
            res.status(200).json({
                success: true,
                data: result.medicines,
                meta: result.meta,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async findById(req, res, next) {
        try {
            const medicine = await medicineService.findById(req.params.id);
            res.status(200).json({
                success: true,
                data: medicine,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async findGroupedById(req, res, next) {
        try {
            const result = await medicineService.findGroupedById(req.params.id);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const data = updateMedicineSchema.parse(req.body);
            const medicine = await medicineService.update(req.params.id, data);
            res.status(200).json({
                success: true,
                message: "Medicine updated successfully",
                data: medicine,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            await medicineService.delete(req.params.id);
            res.status(200).json({
                success: true,
                message: "Medicine deleted successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async quickCreate(req, res, next) {
        try {
            const data = quickCreateMedicineSchema.parse(req.body);
            const medicine = await medicineService.quickCreate(data);
            res.status(201).json({
                success: true,
                message: "Medicine created successfully",
                data: medicine,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export const medicineController = new MedicineController();
//# sourceMappingURL=medicine.controller.js.map