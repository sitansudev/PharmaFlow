import { Supplier } from "@prisma/client";

import { supplierRepository } from "./supplier.repository.js";
import {
  CreateSupplierDTO,
  UpdateSupplierDTO,
} from "./supplier.validation.js";

import { AppError } from "../../shared/errors/app-error.js";

export class SupplierService {
  async create(data: CreateSupplierDTO): Promise<Supplier> {
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

  async findAll(): Promise<Supplier[]> {
    return supplierRepository.findAll();
  }

  async findById(id: string): Promise<Supplier> {
    const supplier = await supplierRepository.findById(id);

    if (!supplier) {
      throw new AppError(404, "Supplier not found");
    }

    return supplier;
  }

  async update(
    id: string,
    data: UpdateSupplierDTO
  ): Promise<Supplier> {
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

  async delete(id: string): Promise<void> {
    await this.findById(id);

    await supplierRepository.delete(id);
  }
}

export const supplierService = new SupplierService();