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

        const purchase =
          await tx.purchase.create({
            data: {
              invoiceNo: data.invoiceNo,
              uniqueNumber: data.uniqueNumber,
              purchaseDate:
                data.purchaseDate ?? new Date(),
              supplierId: data.supplierId,
              totalAmount: 0,
            },
          });

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

          const receivedQuantity =
            item.quantity + item.bonus;

          const discountAmount =
            (item.rate * item.discount) / 100;

          const ccCharge =
            Number(item.ccCharge) || 0;

          /*
           * Purchase item calculation:
           *
           * quantity × rate
           * - discount amount
           * + CC charge
           *
           * CC charge is not discounted.
           */
          const subtotal = Number(
            (
              item.quantity * item.rate -
              item.quantity * discountAmount +
              ccCharge
            ).toFixed(2)
          );

          totalAmount += subtotal;

          const existingBatch =
            await tx.medicineBatch.findFirst({
              where: {
                medicineId: medicine.id,
                batchNo: item.batchNo,
                supplierId: supplier.id,
              },
            });

          let batch;

          if (existingBatch) {
            batch =
              await tx.medicineBatch.update({
                where: {
                  id: existingBatch.id,
                },
                data: {
                  quantity: {
                    increment: receivedQuantity,
                  },
                  remainingQuantity: {
                    increment: receivedQuantity,
                  },
                  bonus: {
                    increment: item.bonus,
                  },
                  rate: item.rate,
                  discount: item.discount,
                  mrp: item.mrp,
                  expiryDate: item.expiryDate,
                  pack: item.pack,
                  rackLocation:
                    item.rackLocation,
                  isActive: true,
                },
              });
          } else {
            batch =
              await tx.medicineBatch.create({
                data: {
                  medicineId: medicine.id,
                  supplierId: supplier.id,
                  purchaseId: purchase.id,
                  batchNo: item.batchNo,
                  pack: item.pack,
                  expiryDate: item.expiryDate,
                  bonus: item.bonus,
                  rate: item.rate,
                  discount: item.discount,
                  mrp: item.mrp,
                  quantity: receivedQuantity,
                  remainingQuantity:
                    receivedQuantity,
                  rackLocation:
                    item.rackLocation,
                  isActive: true,
                },
              });
          }

          await tx.purchaseItem.create({
            data: {
              purchaseId: purchase.id,
              batchId: batch.id,
              quantity: item.quantity,
              rate: item.rate,
              subtotal,
              ccCharge,
            },
          });

          await tx.inventoryTransaction.create({
            data: {
              medicineId: medicine.id,
              batchId: batch.id,
              type: "PURCHASE",
              quantity: receivedQuantity,
              previousStock: medicine.stock,
              newStock:
                medicine.stock +
                receivedQuantity,
              referenceId: purchase.id,
              notes:
                `Purchase Invoice ${purchase.invoiceNo}`,
            },
          });

          await tx.medicine.update({
            where: {
              id: medicine.id,
            },
            data: {
              stock: {
                increment: receivedQuantity,
              },
              latestSupplierId: supplier.id,
              latestBatchNo: item.batchNo,
              latestRate: item.rate,
              latestExpiryDate:
                item.expiryDate,
            },
          });
        }

        /*
         * Round the final purchase amount.
         *
         * Example:
         * ₹1256.73 -> ₹1257
         */
        const roundedTotalAmount =
          Math.round(
            Number(totalAmount.toFixed(2))
          );

        /*
         * Update the purchase using the rounded
         * amount. Prisma will keep this as the
         * correct Decimal type internally.
         */
        await tx.purchase.update({
          where: {
            id: purchase.id,
          },
          data: {
            totalAmount:
              roundedTotalAmount,
          },
        });

        /*
         * Supplier ledger uses the exact same
         * rounded amount as the purchase.
         */
        await tx.supplierLedgerEntry.create({
          data: {
            supplierId: supplier.id,
            date: purchase.purchaseDate,
            uniqueNumber:
              purchase.uniqueNumber,
            invoiceNumber:
              purchase.invoiceNo,
            type: "PURCHASE",
            debit:
              roundedTotalAmount,
            credit: 0,
            referenceId: purchase.id,
          },
        });

        /*
         * Fetch the purchase again so Prisma returns
         * the actual database Decimal type.
         */
        const updatedPurchase =
          await tx.purchase.findUnique({
            where: {
              id: purchase.id,
            },
          });

        if (!updatedPurchase) {
          throw new AppError(
            500,
            "Failed to retrieve created purchase"
          );
        }

        return updatedPurchase;
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

  async getById(id: string) {
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

  async delete(id: string): Promise<void> {
    await purchaseRepository.prisma.$transaction(
      async (tx) => {
        const purchase =
          await tx.purchase.findUnique({
            where: {
              id,
            },
            include: {
              items: true,
            },
          });

        if (!purchase) {
          throw new AppError(
            404,
            "Purchase not found"
          );
        }

        const batchIds = [
          ...new Set(
            purchase.items.map(
              (item) => item.batchId
            )
          ),
        ];

        if (batchIds.length > 0) {
          const soldTransactions =
            await tx.inventoryTransaction.findFirst({
              where: {
                batchId: {
                  in: batchIds,
                },
                type: "SALE",
              },
              select: {
                id: true,
              },
            });

          if (soldTransactions) {
            throw new AppError(
              409,
              "This purchase cannot be deleted because stock from it has already been sold."
            );
          }
        }

        const batches =
          batchIds.length > 0
            ? await tx.medicineBatch.findMany({
                where: {
                  id: {
                    in: batchIds,
                  },
                },
              })
            : [];

        const quantityByBatch =
          new Map<string, number>();

        for (const item of purchase.items) {
          const batch =
            batches.find(
              (b) => b.id === item.batchId
            );

          if (!batch) {
            throw new AppError(
              409,
              `Purchase batch ${item.batchId} no longer exists. Purchase cannot be safely deleted.`
            );
          }

          const purchaseTransaction =
            await tx.inventoryTransaction.findFirst({
              where: {
                batchId: item.batchId,
                referenceId: purchase.id,
                type: "PURCHASE",
              },
              select: {
                quantity: true,
              },
            });

          if (!purchaseTransaction) {
            throw new AppError(
              409,
              `Inventory record for purchase item ${item.id} is missing. Purchase cannot be safely deleted.`
            );
          }

          quantityByBatch.set(
            item.batchId,
            (quantityByBatch.get(
              item.batchId
            ) ?? 0) +
              purchaseTransaction.quantity
          );
        }

        const medicineRollback =
          new Map<string, number>();

        for (const item of purchase.items) {
          const batch =
            batches.find(
              (b) => b.id === item.batchId
            );

          if (!batch) {
            throw new AppError(
              409,
              "Purchase batch not found"
            );
          }

          const quantity =
            quantityByBatch.get(
              item.batchId
            ) ?? 0;

          medicineRollback.set(
            batch.medicineId,
            (medicineRollback.get(
              batch.medicineId
            ) ?? 0) + quantity
          );
        }

        for (const [
          medicineId,
          quantity,
        ] of medicineRollback) {
          const medicine =
            await tx.medicine.findUnique({
              where: {
                id: medicineId,
              },
            });

          if (!medicine) {
            throw new AppError(
              409,
              "Medicine belonging to this purchase no longer exists."
            );
          }

          if (medicine.stock < quantity) {
            throw new AppError(
              409,
              `Cannot delete purchase because current stock for medicine ${medicine.id} is lower than the stock this purchase added.`
            );
          }

          await tx.medicine.update({
            where: {
              id: medicineId,
            },
            data: {
              stock: {
                decrement: quantity,
              },
            },
          });
        }

        for (const [
          batchId,
          quantity,
        ] of quantityByBatch) {
          const batch =
            batches.find(
              (b) => b.id === batchId
            );

          if (!batch) {
            throw new AppError(
              409,
              "Purchase batch not found"
            );
          }

          if (
            batch.quantity < quantity ||
            batch.remainingQuantity <
              quantity
          ) {
            throw new AppError(
              409,
              `Cannot safely reverse batch ${batch.batchNo}. Its current stock has changed since the purchase.`
            );
          }

          const otherPurchaseItems =
            await tx.purchaseItem.count({
              where: {
                batchId,
                purchaseId: {
                  not: purchase.id,
                },
              },
            });

          await tx.medicineBatch.update({
            where: {
              id: batchId,
            },
            data: {
              quantity: {
                decrement: quantity,
              },
              remainingQuantity: {
                decrement: quantity,
              },
              isActive:
                otherPurchaseItems > 0
                  ? batch.isActive
                  : false,
            },
          });
        }

        await tx.inventoryTransaction.deleteMany({
          where: {
            referenceId: purchase.id,
            type: "PURCHASE",
          },
        });

        await tx.supplierLedgerEntry.deleteMany({
          where: {
            referenceId: purchase.id,
            type: "PURCHASE",
          },
        });

        await tx.purchaseItem.deleteMany({
          where: {
            purchaseId: purchase.id,
          },
        });

        await tx.purchase.delete({
          where: {
            id: purchase.id,
          },
        });
      }
    );
  }
}

export const purchaseService =
  new PurchaseService();