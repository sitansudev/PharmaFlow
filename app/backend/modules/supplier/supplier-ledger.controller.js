import { supplierLedgerService } from "./supplier-ledger.service.js";
import { supplierPaymentSchema, } from "./supplier-ledger.validation.js";
export class SupplierLedgerController {
    async getLedger(req, res) {
        const result = await supplierLedgerService.getLedger(req.params.id);
        return res.json({
            success: true,
            data: result,
        });
    }
    async createPayment(req, res) {
        const data = supplierPaymentSchema.parse(req.body);
        const payment = await supplierLedgerService.createPayment(req.params.id, data);
        return res.status(201).json({
            success: true,
            message: "Supplier payment recorded successfully",
            data: payment,
        });
    }
}
export const supplierLedgerController = new SupplierLedgerController();
//# sourceMappingURL=supplier-ledger.controller.js.map