import { Medicine } from "@prisma/client";
import { prisma } from "../../database/prisma.js";
import type { MedicineQuery } from "./medicine.query.js";

import { medicineRepository } from "./medicine.repository.js";
import { auditService } from "../audit/audit.service.js";

import {
  CreateMedicineDTO,
  UpdateMedicineDTO,
} from "./medicine.validation.js";

import { AppError } from "../../shared/errors/app-error.js";

export class MedicineService {
  async create(data: CreateMedicineDTO): Promise<Medicine> {
  return prisma.$transaction(async (tx) => {
    const medicine = await tx.medicine.create({
  data: {
    name: data.name,
    genericName: data.genericName,
    sellingPrice: data.sellingPrice,
    stock: data.stock,
    minimumStock: data.minimumStock,
    unit: data.unit,
    barcode: data.barcode,

    latestSupplierId: data.supplierId,
    latestBatchNo: data.batchNo,
    latestPurchasePrice: data.purchasePrice,
    latestExpiryDate: data.expiryDate,

    category: data.categoryId
      ? {
          connect: {
            id: data.categoryId,
          },
        }
      : undefined,
  },
});

// 👇 ADD THIS HERE
await tx.medicineBatch.create({
  data: {
    medicineId: medicine.id,

    supplierId: data.supplierId,

    batchNo: data.batchNo,

    purchasePrice: data.purchasePrice,

    quantity: data.stock,

    remainingQuantity: data.stock,

    expiryDate: data.expiryDate,

    manufacturingDate: data.manufacturingDate,

    rackLocation: data.rackLocation,

    isActive: true,
  },
});await tx.inventoryTransaction.create({
  data: {
    medicineId: medicine.id,

    type: "PURCHASE",

    quantity: data.stock,

    previousStock: 0,

    newStock: data.stock,

    notes: "Initial stock while creating medicine",
  },
});

// 👇 keep this
return medicine;
    });
}
    

  async findAll(query: MedicineQuery) {
    return medicineRepository.findAll(query);
  }

  async findById(id: string): Promise<Medicine> {
    const medicine = await medicineRepository.findById(id);

    if (!medicine) {
      throw new AppError(404, "Medicine not found");
    }

    return medicine;
  }

  async update(
    id: string,
    data: UpdateMedicineDTO
  ): Promise<Medicine> {
    await this.findById(id);

    const updateData: any = {
      ...data,
    };

    if (data.categoryId) {
      updateData.category = {
        connect: {
          id: data.categoryId,
        },
      };

      delete updateData.categoryId;
    }

    const updatedMedicine = await medicineRepository.update(
      id,
      updateData
    );

    await auditService.create({
      action: "UPDATE",
      entity: "Medicine",
      entityId: updatedMedicine.id,
      oldValue: await this.findById(id),
      newValue: updatedMedicine,
    });

    return updatedMedicine;
  }

  async delete(id: string): Promise<void> {
    const existingMedicine = await this.findById(id);

    await medicineRepository.delete(id);

    await auditService.create({
      action: "DELETE",
      entity: "Medicine",
      entityId: existingMedicine.id,
      oldValue: existingMedicine,
    });
  }
}

export const medicineService = new MedicineService();