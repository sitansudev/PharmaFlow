import { purchaseService } from "./purchase.service.js";
import { createPurchaseSchema } from "./purchase.validation.js";
export class PurchaseController {
    async create(req, res) {
        const data = createPurchaseSchema.parse(req.body);
        const purchase = await purchaseService.create(data);
        return res.status(201).json({
            success: true,
            message: "Purchase created successfully",
            data: purchase,
        });
    }
    async getById(req, res) {
        const purchase = await purchaseService.getById(String(req.params.id));
        return res.status(200).json({
            success: true,
            data: purchase,
        });
    }
    async getAll(req, res) {
        const purchases = await purchaseService.getAll();
        return res.status(200).json({
            success: true,
            count: purchases.length,
            data: purchases,
        });
    }
}
export const purchaseController = new PurchaseController();
//# sourceMappingURL=purchase.controller.js.map