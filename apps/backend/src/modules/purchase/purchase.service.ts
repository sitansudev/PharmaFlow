import { Purchase } from "@prisma/client";

import { purchaseRepository } from "./purchase.repository.js";
import { CreatePurchaseDTO } from "./purchase.validation.js";

import { AppError } from "../../shared/errors/app-error.js";

export class PurchaseService {
  async create(data: CreatePurchaseDTO): Promise<Purchase> {
    return purchaseRepository.prisma.$transaction(async (tx) => {
      const supplier = await tx.supplier.findUnique({
        where: {
          id: data.supplierId,
        },
      });

      if (!supplier) {
        throw new AppError(404, "Supplier not found");
      }

      let totalAmount = 0;

      const purchase = await tx.purchase.create({
        data: {
          invoiceNo: data.invoiceNo,
          purchaseDate: data.purchaseDate ?? new Date(),
          supplierId: data.supplierId,
          totalAmount: 0,
        },
      });

      for (const item of data.items) {
        const medicine = await tx.medicine.findUnique({
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

        const subtotal = item.quantity * item.purchasePrice;

        totalAmount += subtotal;

        const batch = await tx.medicineBatch.create({
          data: {
            medicineId: medicine.id,
            supplierId: supplier.id,
            purchaseId: purchase.id,

            batchNo: item.batchNo,
            manufacturingDate: item.manufacturingDate,
            expiryDate: item.expiryDate,

            purchasePrice: item.purchasePrice,

            quantity: item.quantity,
            remainingQuantity: item.quantity,

            rackLocation: item.rackLocation,
          },
        });

        await tx.purchaseItem.create({
          data: {
            purchaseId: purchase.id,
            batchId: batch.id,
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
            subtotal,
          },
        });

        await tx.inventoryTransaction.create({
          data: {
            medicineId: medicine.id,
            batchId: batch.id,
            type: "PURCHASE",
            quantity: item.quantity,
            previousStock: medicine.stock,
            newStock: medicine.stock + item.quantity,
            referenceId: purchase.id,
            notes: `Purchase Invoice ${purchase.invoiceNo}`,
          },
        });

        await tx.medicine.update({
  where: {
    id: medicine.id,
  },
  data: {
    stock: {
      increment: item.quantity,
    },
    latestSupplierId: supplier.id,
    latestBatchNo: item.batchNo,
    latestPurchasePrice: item.purchasePrice,
    latestExpiryDate: item.expiryDate,
  },
});
      }

      await tx.purchase.update({
        where: {
          id: purchase.id,
        },
        data: {
          totalAmount,
        },
      });

      return purchase;
    });
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
    const purchase = await purchaseRepository.prisma.purchase.findUnique({
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
      throw new AppError(404, "Purchase not found");
    }

    return purchase;
  }
}

export const purchaseService = new PurchaseService();