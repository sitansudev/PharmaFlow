import {
  Prisma,
  Customer,
} from "@prisma/client";

import { prisma } from "../../database/prisma.js";

export class CustomerRepository {
  async create(
    data: Prisma.CustomerCreateInput
  ): Promise<Customer> {
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

  async findById(
    id: string
  ): Promise<Customer | null> {
    return prisma.customer.findUnique({
      where: {
        id,
      },
    });
  }

  async findByPhone(
    phone: string
  ): Promise<Customer | null> {
    return prisma.customer.findUnique({
      where: {
        phone,
      },
    });
  }

  async findByEmail(
    email: string
  ): Promise<Customer | null> {
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

  async delete(
    id: string
  ): Promise<Customer> {
    return prisma.customer.delete({
      where: {
        id,
      },
    });
  }

  async recordPayment(
    id: string,
    amount: Prisma.Decimal
  ): Promise<Customer> {
    return prisma.$transaction(
      async (tx) => {
        const customer =
          await tx.customer.findUnique({
            where: { id },
          });

        if (!customer) {
          throw new Error(
            "Customer not found"
          );
        }

        if (
          customer.dueAmount.lt(amount)
        ) {
          throw new Error(
            "Payment cannot be greater than due amount"
          );
        }

        return tx.customer.update({
          where: { id },
          data: {
            dueAmount: {
              decrement: amount,
            },
          },
        });
      }
    );
  }
}

export const customerRepository =
  new CustomerRepository();
