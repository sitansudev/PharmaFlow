import { purchaseRepository } from "./purchase.repository.js";
import { AppError } from "../../shared/errors/app-error.js";

export class PurchaseService {
    async create(data) {
        return purchaseRepository.prisma.$transaction(
            async (tx) => {
                /*
                 * Validate supplier.
                 */
                const supplier =
                    await tx.supplier.findUnique({
                        where: {
                            id: data.supplierId,
                        },
                    });

                if (!supplier) {
                    throw new AppError(
                        404,
                        "Supplier not found"
                    );
                }

                let totalAmount = 0;

                /*
                 * Create purchase first.
                 *
                 * Final total is calculated after
                 * all purchase items are processed.
                 */
                const purchase =
                    await tx.purchase.create({
                        data: {
                            invoiceNo:
                                data.invoiceNo,

                            uniqueNumber:
                                data.uniqueNumber,

                            purchaseDate:
                                data.purchaseDate ??
                                new Date(),

                            supplierId:
                                data.supplierId,

                            totalAmount: 0,
                        },
                    });

                /*
                 * Process every purchase item.
                 */
                for (const item of data.items) {
                    const medicine =
                        await tx.medicine.findUnique({
                            where: {
                                id: item.medicineId,
                            },
                        });

                    if (!medicine) {
                        throw new AppError(
                            404,
                            `Medicine not found: ${item.medicineId}`
                        );
                    }

                    /*
                     * Bonus units are free units.
                     *
                     * They increase physical stock
                     * but do not increase purchase cost.
                     */
                    const receivedQuantity =
                        item.quantity +
                        item.bonus;

                    /*
                     * Discount applies ONLY to rate.
                     */
                    const discountAmount =
                        (item.rate *
                            item.discount) /
                        100;

                    const netRate =
                        Number(
                            (
                                item.rate -
                                discountAmount
                            ).toFixed(2)
                        );

                    /*
                     * Amount after discount.
                     */
                    const amountAfterDiscount =
                        Number(
                            (
                                item.quantity *
                                netRate
                            ).toFixed(2)
                        );

                    /*
                     * CC Charge belongs to THIS
                     * medicine item.
                     *
                     * It is NOT discounted.
                     *
                     * It is added ONCE to the
                     * medicine row total.
                     */
                    const ccCharge =
                        Number(
                            item.ccCharge ??
                            0
                        );

                    /*
                     * Final medicine item total:
                     *
                     * (quantity × discounted rate)
                     * + CC charge
                     */
                    const subtotal =
                        Number(
                            (
                                amountAfterDiscount +
                                ccCharge
                            ).toFixed(2)
                        );

                    totalAmount += subtotal;

                    /*
                     * Find existing batch.
                     *
                     * A batch is uniquely identified by:
                     *
                     * medicine + batch number + supplier
                     */
                    const existingBatch =
                        await tx.medicineBatch.findFirst({
                            where: {
                                medicineId:
                                    medicine.id,

                                batchNo:
                                    item.batchNo,

                                supplierId:
                                    supplier.id,
                            },
                        });

                    let batch;

                    if (existingBatch) {
                        /*
                         * Existing batch.
                         *
                         * Increase physical stock
                         * and update latest commercial data.
                         */
                        batch =
                            await tx.medicineBatch.update({
                                where: {
                                    id: existingBatch.id,
                                },

                                data: {
                                    quantity: {
                                        increment:
                                            receivedQuantity,
                                    },

                                    remainingQuantity: {
                                        increment:
                                            receivedQuantity,
                                    },

                                    bonus: {
                                        increment:
                                            item.bonus,
                                    },

                                    rate:
                                        item.rate,

                                    discount:
                                        item.discount,

                                    mrp:
                                        item.mrp,

                                    expiryDate:
                                        item.expiryDate,

                                    pack:
                                        item.pack,

                                    rackLocation:
                                        item.rackLocation,

                                    isActive:
                                        true,
                                },
                            });
                    } else {
                        /*
                         * New batch.
                         */
                        batch =
                            await tx.medicineBatch.create({
                                data: {
                                    medicineId:
                                        medicine.id,

                                    supplierId:
                                        supplier.id,

                                    purchaseId:
                                        purchase.id,

                                    batchNo:
                                        item.batchNo,

                                    pack:
                                        item.pack,

                                    expiryDate:
                                        item.expiryDate,

                                    bonus:
                                        item.bonus,

                                    rate:
                                        item.rate,

                                    discount:
                                        item.discount,

                                    mrp:
                                        item.mrp,

                                    quantity:
                                        receivedQuantity,

                                    remainingQuantity:
                                        receivedQuantity,

                                    rackLocation:
                                        item.rackLocation,

                                    isActive:
                                        true,
                                },
                            });
                    }

                    /*
                     * Store the paid quantity,
                     * item CC charge and final
                     * item subtotal.
                     */
                    await tx.purchaseItem.create({
                        data: {
                            purchaseId:
                                purchase.id,

                            batchId:
                                batch.id,

                            quantity:
                                item.quantity,

                            rate:
                                item.rate,

                            ccCharge:
                                ccCharge,

                            subtotal:
                                subtotal,
                        },
                    });

                    /*
                     * Record complete physical stock,
                     * including bonus.
                     */
                    await tx.inventoryTransaction.create({
                        data: {
                            medicineId:
                                medicine.id,

                            batchId:
                                batch.id,

                            type: "PURCHASE",

                            quantity:
                                receivedQuantity,

                            previousStock:
                                medicine.stock,

                            newStock:
                                medicine.stock +
                                receivedQuantity,

                            referenceId:
                                purchase.id,
                        },
                    });

                    /*
                     * Update medicine stock.
                     */
                    await tx.medicine.update({
                        where: {
                            id: medicine.id,
                        },

                        data: {
                            stock: {
                                increment:
                                    receivedQuantity,
                            },
                        },
                    });
                }

                /*
                 * Store final purchase total.
                 *
                 * This is already the sum of:
                 *
                 * (quantity × discounted rate)
                 * + item CC charge
                 */
                totalAmount =
                    Number(
                        totalAmount.toFixed(2)
                    );

                await tx.purchase.update({
                    where: {
                        id: purchase.id,
                    },

                    data: {
                        totalAmount:
                            totalAmount,
                    },
                });

                /*
                 * Supplier ledger.
                 *
                 * The pharmacy owes the supplier
                 * the final purchase amount.
                 */
                await tx.supplierLedgerEntry.create({
                    data: {
                        date:
                            purchase.purchaseDate,

                        uniqueNumber:
                            purchase.uniqueNumber,

                        invoiceNumber:
                            purchase.invoiceNo,

                        type: "PURCHASE",

                        debit:
                            totalAmount,

                        credit: 0,

                        referenceId:
                            purchase.id,
                    },
                });

                return purchase;
            }
        );
    }

    async getAll() {
        return purchaseRepository.prisma.purchase.findMany({
            orderBy: {
                purchaseDate: "desc",
            },

            include: {
                supplier: true,

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
        const purchase =
            await purchaseRepository.prisma.purchase.findUnique({
                where: {
                    id,
                },

                include: {
                    supplier: true,

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

        if (!purchase) {
            throw new AppError(
                404,
                "Purchase not found"
            );
        }

        return purchase;
    }
}

export const purchaseService =
    new PurchaseService();