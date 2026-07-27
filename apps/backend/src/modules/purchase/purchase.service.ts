import { Purchase } from "@prisma/client";

import { purchaseRepository } from "./purchase.repository.js";
import { CreatePurchaseDTO } from "./purchase.validation.js";

import { AppError } from "../../shared/errors/app-error.js";

export class PurchaseService {
  async create(data: CreatePurchaseDTO): Promise<Purchase> {
    return purchaseRepository.prisma.$transaction(async (tx) => {
      // Check supplier
      const supplier = await tx.supplier.findUnique({
        where: {
          id: data.supplierId,
        },
      });

      if (!supplier) {
        throw new AppError(404, "Supplier not found");
      }

      let totalAmount = 0;

      // Validate medicines and calculate total
      for (const item of data.items) {
        const medicine = await tx.medicine.findUnique({
          where: {
            id: item.medicineId,
          },
        });

        if (!medicine) {
          throw new AppError(404, "Medicine not found");
        }

        totalAmount += item.quantity * item.purchasePrice;
      }

      // Create purchase
      const purchase = await tx.purchase.create({
        data: {
          invoiceNo: data.invoiceNo,
          purchaseDate: data.purchaseDate ?? new Date(),
          supplierId: data.supplierId,
          totalAmount,
        },
      });

      // Create purchase items and update stock
      for (const item of data.items) {
        await tx.purchaseItem.create({
          data: {
            purchaseId: purchase.id,
            medicineId: item.medicineId,
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
            subtotal: item.quantity * item.purchasePrice,
          },
        });

        await tx.medicine.update({
          where: {
            id: item.medicineId,
          },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      return purchase;
    });
  }
}

export const purchaseService = new PurchaseService();
