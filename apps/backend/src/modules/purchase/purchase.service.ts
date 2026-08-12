import { Purchase } from "@prisma/client";

import { purchaseRepository } from "./purchase.repository.js";
import { CreatePurchaseDTO } from "./purchase.validation.js";

import { AppError } from "../../shared/errors/app-error.js";

export class PurchaseService {
  async create(
    data: CreatePurchaseDTO
  ): Promise<Purchase> {
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
         * Total is calculated after all
         * purchase items are processed.
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
           * Bonus units are free units received
           * from the supplier.
           *
           * They increase physical stock but
           * do not increase purchase cost.
           */
          const receivedQuantity =
            item.quantity +
            item.bonus;

          /*
           * RATE is the actual purchase cost
           * per purchased unit.
           *
           * Bonus units are excluded from cost.
           */
          const subtotal =
            item.quantity *
            item.rate;

          totalAmount += subtotal;

          /*
           * A batch is uniquely identified by:
           *
           * medicine + batch number + supplier
           *
           * If the same supplier sends the same
           * batch again, update the existing batch.
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
             * Increase physical stock and
             * update the latest commercial data.
             */
            batch =
              await tx.medicineBatch.update({
                where: {
                  id:
                    existingBatch.id,
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

                  /*
                   * Purchase rate.
                   */
                  rate:
                    item.rate,

                  /*
                   * Purchase discount.
                   */
                  discount:
                    item.discount,

                  /*
                   * MRP / selling price.
                   */
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

                  /*
                   * RATE = purchase cost.
                   */
                  rate:
                    item.rate,

                  /*
                   * Purchase discount.
                   */
                  discount:
                    item.discount,

                  /*
                   * MRP = selling price.
                   */
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
           * PurchaseItem records only the
           * paid/purchased quantity.
           *
           * Bonus is free stock and therefore
           * is not included in the purchase cost.
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

              subtotal,
            },
          });

          /*
           * Record complete physical stock
           * received, including bonus.
           */
          await tx.inventoryTransaction.create({
            data: {
              medicineId:
                medicine.id,

              batchId:
                batch.id,

              type:
                "PURCHASE",

              quantity:
                receivedQuantity,

              previousStock:
                medicine.stock,

              newStock:
                medicine.stock +
                receivedQuantity,

              referenceId:
                purchase.id,

              notes:
                `Purchase Invoice ${purchase.invoiceNo}`,
            },
          });

          /*
           * Update medicine-level stock and
           * latest purchase summary.
           *
           * latestRate is the latest purchase rate.
           */
          await tx.medicine.update({
            where: {
              id:
                medicine.id,
            },

            data: {
              stock: {
                increment:
                  receivedQuantity,
              },

              latestSupplierId:
                supplier.id,

              latestBatchNo:
                item.batchNo,

              latestRate:
                item.rate,

              latestExpiryDate:
                item.expiryDate,
            },
          });
        }

        /*
         * Update final purchase total.
         *
         * Bonus units do not affect the amount.
         */
        await tx.purchase.update({
          where: {
            id:
              purchase.id,
          },

          data: {
            totalAmount,
          },
        });

        /*
         * Supplier ledger.
         *
         * Every purchase creates a debit because
         * the pharmacy owes the supplier.
         */
        await tx.supplierLedgerEntry.create({
          data: {
            supplierId:
              supplier.id,

            date:
              purchase.purchaseDate,

            /*
             * Use the purchase unique number
             * when available.
             */
            uniqueNumber:
              purchase.uniqueNumber,

            invoiceNumber:
              purchase.invoiceNo,

            type:
              "PURCHASE",

            debit:
              totalAmount,

            credit:
              0,

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
        purchaseDate:
          "desc",
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

  async getById(
    id: string
  ) {
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