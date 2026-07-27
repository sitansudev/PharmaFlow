import { Medicine } from "@prisma/client";

import { medicineRepository } from "./medicine.repository.js";
import {
  CreateMedicineDTO,
  UpdateMedicineDTO,
} from "./medicine.validation.js";

import { AppError } from "../../shared/errors/app-error.js";

export class MedicineService {
  async create(data: CreateMedicineDTO): Promise<Medicine> {
    const existingMedicine = await medicineRepository.findByBatchNo(
      data.batchNo
    );

    if (existingMedicine) {
      throw new AppError(409, "Batch number already exists");
    }

    return medicineRepository.create({
  name: data.name,
  genericName: data.genericName,
  brand: data.brand,
  batchNo: data.batchNo,
  expiryDate: data.expiryDate,
  purchasePrice: data.purchasePrice,
  sellingPrice: data.sellingPrice,
  stock: data.stock,
  unit: data.unit,
  category: data.categoryId
    ? {
        connect: {
          id: data.categoryId,
        },
      }
    : undefined,
});
  }

  async findAll(): Promise<Medicine[]> {
    return medicineRepository.findAll();
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

    return medicineRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);

    await medicineRepository.delete(id);
  }
}

export const medicineService = new MedicineService();