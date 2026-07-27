import { Prisma, Supplier } from "@prisma/client";
import { prisma } from "../../database/prisma.js";

export class SupplierRepository {
  async create(data: Prisma.SupplierCreateInput): Promise<Supplier> {
    return prisma.supplier.create({
      data,
    });
  }

  async findAll(): Promise<Supplier[]> {
    return prisma.supplier.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string): Promise<Supplier | null> {
    return prisma.supplier.findUnique({
      where: {
        id,
      },
    });
  }

  async findByPhone(phone: string): Promise<Supplier | null> {
    return prisma.supplier.findUnique({
      where: {
        phone,
      },
    });
  }

  async findByEmail(email: string): Promise<Supplier | null> {
    return prisma.supplier.findUnique({
      where: {
        email,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.SupplierUpdateInput
  ): Promise<Supplier> {
    return prisma.supplier.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string): Promise<Supplier> {
    return prisma.supplier.delete({
      where: {
        id,
      },
    });
  }
}

export const supplierRepository = new SupplierRepository();