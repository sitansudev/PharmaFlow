import { Prisma, Medicine } from "@prisma/client";
import { prisma } from "../../database/prisma.js";

export class MedicineRepository {
  async create(data: Prisma.MedicineCreateInput): Promise<Medicine> {
    return prisma.medicine.create({
      data,
    });
  }

  async findAll(): Promise<Medicine[]> {
    return prisma.medicine.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string): Promise<Medicine | null> {
    return prisma.medicine.findUnique({
      where: {
        id,
      },
    });
  }

  async findByBatchNo(batchNo: string): Promise<Medicine | null> {
    return prisma.medicine.findUnique({
      where: {
        batchNo,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.MedicineUpdateInput
  ): Promise<Medicine> {
    return prisma.medicine.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string): Promise<Medicine> {
    return prisma.medicine.delete({
      where: {
        id,
      },
    });
  }
}

export const medicineRepository = new MedicineRepository();