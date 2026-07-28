import { Prisma, Customer } from "@prisma/client";
import { prisma } from "../../database/prisma.js";

export class CustomerRepository {
  async create(data: Prisma.CustomerCreateInput): Promise<Customer> {
    return prisma.customer.create({
      data,
    });
  }

  async findAll(): Promise<Customer[]> {
    return prisma.customer.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string): Promise<Customer | null> {
    return prisma.customer.findUnique({
      where: {
        id,
      },
    });
  }

  async findByPhone(phone: string): Promise<Customer | null> {
    return prisma.customer.findUnique({
      where: {
        phone,
      },
    });
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return prisma.customer.findUnique({
      where: {
        email,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.CustomerUpdateInput
  ): Promise<Customer> {
    return prisma.customer.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string): Promise<Customer> {
    return prisma.customer.delete({
      where: {
        id,
      },
    });
  }
}

export const customerRepository = new CustomerRepository();