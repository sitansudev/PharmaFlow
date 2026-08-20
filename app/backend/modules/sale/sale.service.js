import { PaymentStatus, } from "@prisma/client";
import { saleRepository } from "./sale.repository.js";
import { AppError } from "../../shared/errors/app-error.js";
export class SaleService {
    async create(data) {
        return saleRepository.prisma.$transaction(async (tx) => {
            /*
             * Prevent duplicate invoice numbers.
             */
            const existingSale = await tx.sale.findUnique({
                where: {
                    invoiceNo: data.invoiceNo,
                },
            });
            if (existingSale) {
                throw new AppError(409, "Invoice already exists");
            }
            /*
             * Validate customer if supplied.
             */
            if (data.customerId) {
                const customer = await tx.customer.findUnique({
                    where: {
                        id: data.customerId,
                    },
                });
                if (!customer) {
                    throw new AppError(404, "Customer not found");
                }
            }
            /*
             * Validate all batches and calculate
             * the original subtotal before discount.
             */
            let subtotalAmount = 0;
            const validatedItems = [];
            for (const item of data.items) {
                const batch = await tx.medicineBatch.findUnique({
                    where: {
                        id: item.batchId,
                    },
                    include: {
                        medicine: true,
                    },
                });
                if (!batch) {
                    throw new AppError(404, "Medicine batch not found");
                }
                /*
                 * Expiry check.
                 */
                if (batch.expiryDate <=
                    new Date()) {
                    throw new AppError(400, `${batch.medicine.name} batch ${batch.batchNo} has expired`);
                }
                /*
                 * Batch stock check.
                 */
                if (batch.remainingQuantity <
                    item.quantity) {
                    throw new AppError(400, `${batch.medicine.name} has only ${batch.remainingQuantity} units remaining`);
                }
                const subtotal = Number(batch.mrp) * item.quantity;
                subtotalAmount += subtotal;
                validatedItems.push({
                    batch,
                    subtotal,
                });
            }
            /*
             * Calculate discount.
             *
             * Example:
             *
             * subtotal = ₹155
             * discountPercent = 5
             *
             * discountAmount = ₹7.75
             * finalTotal = ₹147.25
             */
            const discountPercent = Number(data.discountPercent ?? 0);
            const discountAmount = Number((subtotalAmount *
                discountPercent) / 100).toFixed(2);
            const totalAmount = Number((subtotalAmount -
                Number(discountAmount)).toFixed(2));
            /*
             * Create sale.
             */
            const sale = await tx.sale.create({
                data: {
                    invoiceNo: data.invoiceNo,
                    customer: data.customerId
                        ? {
                            connect: {
                                id: data.customerId,
                            },
                        }
                        : undefined,
                    /*
                     * Final amount after discount.
                     */
                    totalAmount,
                    /*
                     * Actual money discounted.
                     */
                    discount: Number(discountAmount),
                    /*
                     * Percentage given by pharmacist.
                     */
                    discountPercent,
                    tax: 0,
                    paymentMethod: data.paymentMethod,
                    paymentStatus: PaymentStatus.PAID,
                    paidAmount: totalAmount,
                    balanceAmount: 0,
                },
            });
            /*
             * Process each sale item.
             */
            for (let i = 0; i < data.items.length; i++) {
                const item = data.items[i];
                const { batch, subtotal, } = validatedItems[i];
                /*
                 * Reduce batch stock atomically.
                 */
                const batchUpdate = await tx.medicineBatch.updateMany({
                    where: {
                        id: batch.id,
                        isActive: true,
                        remainingQuantity: {
                            gte: item.quantity,
                        },
                    },
                    data: {
                        remainingQuantity: {
                            decrement: item.quantity,
                        },
                    },
                });
                if (batchUpdate.count !== 1) {
                    throw new AppError(400, `${batch.medicine.name} does not have enough stock in batch ${batch.batchNo}`);
                }
                /*
                 * Medicine-level stock.
                 */
                const previousStock = batch.medicine.stock;
                const medicineUpdate = await tx.medicine.updateMany({
                    where: {
                        id: batch.medicineId,
                        stock: {
                            gte: item.quantity,
                        },
                    },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });
                if (medicineUpdate.count !== 1) {
                    throw new AppError(400, `${batch.medicine.name} does not have enough total stock`);
                }
                /*
       * Create sale item.
       *
       * Item subtotal stays BEFORE
       * overall sale discount.
       */
                await tx.saleItem.create({
                    data: {
                        saleId: sale.id,
                        batchId: batch.id,
                        quantity: item.quantity,
                        /*
                         * Purchase rate stored for
                         * accounting/profit calculations.
                         */
                        costPrice: batch.rate,
                        /*
                         * MRP is the actual selling price
                         * used for this sale.
                         */
                        mrp: batch.mrp,
                        /*
                         * Item subtotal is calculated
                         * before the overall sale discount.
                         */
                        subtotal,
                    },
                });
                /*
                 * Inventory transaction.
                 */
                await tx.inventoryTransaction.create({
                    data: {
                        medicineId: batch.medicineId,
                        batchId: batch.id,
                        type: "SALE",
                        quantity: item.quantity,
                        previousStock,
                        newStock: previousStock -
                            item.quantity,
                        referenceId: sale.id,
                        notes: `Sale ${sale.invoiceNo}`,
                    },
                });
            }
            /*
             * Return complete sale.
             */
            return tx.sale.findUniqueOrThrow({
                where: {
                    id: sale.id,
                },
                include: {
                    customer: true,
                    items: {
                        include: {
                            batch: {
                                include: {
                                    medicine: true,
                                },
                            },
                        },
                    },
                },
            });
        });
    }
    async getAll() {
        return saleRepository.prisma.sale.findMany({
            orderBy: {
                saleDate: "desc",
            },
            include: {
                customer: true,
                items: {
                    include: {
                        batch: {
                            include: {
                                medicine: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async getById(id) {
        const sale = await saleRepository.prisma.sale.findUnique({
            where: {
                id,
            },
            include: {
                customer: true,
                items: {
                    include: {
                        batch: {
                            include: {
                                medicine: true,
                            },
                        },
                    },
                },
            },
        });
        if (!sale) {
            throw new AppError(404, "Sale not found");
        }
        return sale;
    }
}
export const saleService = new SaleService();
//# sourceMappingURL=sale.service.js.map