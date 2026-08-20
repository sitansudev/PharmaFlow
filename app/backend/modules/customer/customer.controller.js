import { customerService } from "./customer.service.js";
import { createCustomerSchema, updateCustomerSchema, recordPaymentSchema, } from "./customer.validation.js";
export class CustomerController {
    async create(req, res, next) {
        try {
            const data = createCustomerSchema.parse(req.body);
            const customer = await customerService.create(data);
            res.status(201).json({
                success: true,
                message: "Customer created successfully",
                data: customer,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async findAll(req, res, next) {
        try {
            const customers = await customerService.findAll();
            res.json({
                success: true,
                data: customers,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async findById(req, res, next) {
        try {
            const customer = await customerService.findById(req.params.id);
            res.json({
                success: true,
                data: customer,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const data = updateCustomerSchema.parse(req.body);
            const customer = await customerService.update(req.params.id, data);
            res.json({
                success: true,
                message: "Customer updated successfully",
                data: customer,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            await customerService.delete(req.params.id);
            res.json({
                success: true,
                message: "Customer deleted successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    async recordPayment(req, res, next) {
        try {
            const data = recordPaymentSchema.parse(req.body);
            const customer = await customerService.recordPayment(req.params.id, data);
            res.json({
                success: true,
                message: "Payment recorded successfully",
                data: customer,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export const customerController = new CustomerController();
//# sourceMappingURL=customer.controller.js.map