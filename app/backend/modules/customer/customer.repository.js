import { prisma } from "../../database/prisma.js";
export class CustomerRepository {
    async create(data) {
        return prisma.customer.create({
            data,
        });
    }
    async findAll() {
        return prisma.customer.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    async findById(id) {
        return prisma.customer.findUnique({
            where: {
                id,
            },
        });
    }
    async findByPhone(phone) {
        return prisma.customer.findUnique({
            where: {
                phone,
            },
        });
    }
    async findByEmail(email) {
        return prisma.customer.findUnique({
            where: {
                email,
            },
        });
    }
    async update(id, data) {
        return prisma.customer.update({
            where: {
                id,
            },
            data,
        });
    }
    async delete(id) {
        return prisma.customer.delete({
            where: {
                id,
            },
        });
    }
    async recordPayment(id, amount) {
        return prisma.$transaction(async (tx) => {
            const customer = await tx.customer.findUnique({
                where: { id },
            });
            if (!customer) {
                throw new Error("Customer not found");
            }
            if (customer.dueAmount.lt(amount)) {
                throw new Error("Payment cannot be greater than due amount");
            }
            return tx.customer.update({
                where: { id },
                data: {
                    dueAmount: {
                        decrement: amount,
                    },
                },
            });
        });
    }
}
export const customerRepository = new CustomerRepository();
//# sourceMappingURL=customer.repository.js.map