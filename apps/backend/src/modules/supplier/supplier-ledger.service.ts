import { PaymentMethod } from "@prisma/client";

import { AppError } from "../../shared/errors/app-error.js";

import { supplierRepository } from "./supplier.repository.js";
import {
  supplierLedgerRepository,
} from "./supplier-ledger.repository.js";

import type {
  SupplierPaymentDTO,
} from "./supplier-ledger.validation.js";

export class SupplierLedgerService {
  async getLedger(supplierId: string) {
    const supplier =
      await supplierRepository.findById(supplierId);

    if (!supplier) {
      throw new AppError(404, "Supplier not found");
    }

    const entries =
      await supplierLedgerRepository.findBySupplier(
        supplierId
      );

    let balance = 0;

    const ledger = entries.map((entry) => {
      balance +=
        Number(entry.debit) -
        Number(entry.credit);

      return {
        id: entry.id,
        date: entry.date,
        uniqueNumber: entry.uniqueNumber,
        invoiceNumber: entry.invoiceNumber,
        type: entry.type,
        debit: Number(entry.debit),
        credit: Number(entry.credit),
        balance,
        paymentMethod: entry.paymentMethod,
        referenceId: entry.referenceId,
        notes: entry.notes,
      };
    });

    const totals =
      await supplierLedgerRepository.getTotals(
        supplierId
      );

    return {
      supplier,
      entries: ledger,
      totals: {
        debit: totals.debit,
        credit: totals.credit,
        balance:
          totals.debit - totals.credit,
      },
    };
  }

  async createPayment(
    supplierId: string,
    data: SupplierPaymentDTO
  ) {
    const supplier =
      await supplierRepository.findById(supplierId);

    if (!supplier) {
      throw new AppError(404, "Supplier not found");
    }

    const totals =
      await supplierLedgerRepository.getTotals(
        supplierId
      );

    const currentBalance =
      totals.debit - totals.credit;

    if (data.amount > currentBalance) {
      throw new AppError(
        400,
        `Payment cannot be greater than outstanding balance of ₹${currentBalance.toFixed(
          2
        )}`
      );
    }

    return supplierLedgerRepository.create({
      supplier: {
        connect: {
          id: supplierId,
        },
      },

      date: data.date ?? new Date(),

      uniqueNumber:
        data.uniqueNumber?.trim() || null,

      invoiceNumber:
        data.invoiceNumber.trim(),

      type: "PAYMENT",

      debit: 0,

      credit: data.amount,

      paymentMethod:
        data.paymentMethod as PaymentMethod,

      notes: data.notes?.trim() || null,
    });
  }
}

export const supplierLedgerService =
  new SupplierLedgerService();