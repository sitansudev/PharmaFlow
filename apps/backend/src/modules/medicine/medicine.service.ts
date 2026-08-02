import { Medicine } from "@prisma/client";

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
    const medicine = await medicineRepository.create({
  name: data.name,
  genericName: data.genericName,
  sellingPrice: data.sellingPrice,
  unit: data.unit,
  minimumStock: data.minimumStock,

  category: data.categoryId
    ? {
        connect: {
          id: data.categoryId,
        },
      }
    : undefined,
});

    await auditService.create({
      action: "CREATE",
      entity: "Medicine",
      entityId: medicine.id,
      newValue: medicine,
    });

    return medicine;
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