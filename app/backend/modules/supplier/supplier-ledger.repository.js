import { prisma } from "../../database/prisma.js";
export class SupplierLedgerRepository {
    async findBySupplier(supplierId) {
        return prisma.supplierLedgerEntry.findMany({
            where: {
                supplierId,
            },
            orderBy: [
                {
                    date: "asc",
                },
                {
                    createdAt: "asc",
                },
            ],
        });
    }
    async create(data) {
        return prisma.supplierLedgerEntry.create({
            data,
        });
    }
    async getTotals(supplierId) {
        const result = await prisma.supplierLedgerEntry.aggregate({
            where: {
                supplierId,
            },
            _sum: {
                debit: true,
                credit: true,
            },
        });
        return {
            debit: Number(result._sum.debit ?? 0),
            credit: Number(result._sum.credit ?? 0),
        };
    }
    async findLatestBySupplier(supplierId) {
        return prisma.supplierLedgerEntry.findFirst({
            where: {
                supplierId,
            },
            orderBy: [
                {
                    date: "desc",
                },
                {
                    createdAt: "desc",
                },
            ],
        });
    }
}
export const supplierLedgerRepository = new SupplierLedgerRepository();
//# sourceMappingURL=supplier-ledger.repository.js.map