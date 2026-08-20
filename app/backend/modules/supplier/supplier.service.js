import { supplierRepository } from "./supplier.repository.js";
import { AppError } from "../../shared/errors/app-error.js";
export class SupplierService {
    async create(data) {
        const phoneExists = await supplierRepository.findByPhone(data.phone);
        if (phoneExists) {
            throw new AppError(409, "Phone number already exists");
        }
        if (data.email) {
            const emailExists = await supplierRepository.findByEmail(data.email);
            if (emailExists) {
                throw new AppError(409, "Email already exists");
            }
        }
        return supplierRepository.create(data);
    }
    async findAll() {
        return supplierRepository.findAll();
    }
    async findById(id) {
        const supplier = await supplierRepository.findById(id);
        if (!supplier) {
            throw new AppError(404, "Supplier not found");
        }
        return supplier;
    }
    async update(id, data) {
        await this.findById(id);
        if (data.phone) {
            const existing = await supplierRepository.findByPhone(data.phone);
            if (existing && existing.id !== id) {
                throw new AppError(409, "Phone number already exists");
            }
        }
        if (data.email) {
            const existing = await supplierRepository.findByEmail(data.email);
            if (existing && existing.id !== id) {
                throw new AppError(409, "Email already exists");
            }
        }
        return supplierRepository.update(id, data);
    }
    async delete(id) {
        await this.findById(id);
        await supplierRepository.delete(id);
    }
}
export const supplierService = new SupplierService();
//# sourceMappingURL=supplier.service.js.map