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
  async getLedger(
    supplierId: string
  ) {
    const supplier =
      await supplierRepository.findById(
        supplierId
      );

    if (!supplier) {
      throw new AppError(
        404,
        "Supplier not found"
      );
    }

    const entries =
      await supplierLedgerRepository.findBySupplier(
        supplierId
      );

    let balance = 0;

    const ledger = entries.map(
      (entry) => {
        const debit = Math.round(
          Number(entry.debit) || 0
        );

        const credit = Math.round(
          Number(entry.credit) || 0
        );

        balance = Math.round(
          balance + debit - credit
        );

        return {
          id: entry.id,
          date: entry.date,
          uniqueNumber:
            entry.uniqueNumber,
          invoiceNumber:
            entry.invoiceNumber,
          type: entry.type,
          debit,
          credit,
          balance,
          paymentMethod:
            entry.paymentMethod,
          referenceId:
            entry.referenceId,
          notes: entry.notes,
        };
      }
    );

    const totals =
      await supplierLedgerRepository.getTotals(
        supplierId
      );

    const totalDebit = Math.round(
      Number(totals.debit) || 0
    );

    const totalCredit = Math.round(
      Number(totals.credit) || 0
    );

    return {
      supplier,

      entries: ledger,

      totals: {
        debit: totalDebit,
        credit: totalCredit,
        balance: Math.round(
          totalDebit - totalCredit
        ),
      },
    };
  }

  async createPayment(
    supplierId: string,
    data: SupplierPaymentDTO
  ) {
    const supplier =
      await supplierRepository.findById(
        supplierId
      );

    if (!supplier) {
      throw new AppError(
        404,
        "Supplier not found"
      );
    }

    const totals =
      await supplierLedgerRepository.getTotals(
        supplierId
      );

    const currentBalance =
      Math.round(
        (Number(totals.debit) || 0) -
        (Number(totals.credit) || 0)
      );

    const paymentAmount = Math.round(
      Number(data.amount) || 0
    );

    if (paymentAmount > currentBalance) {
      throw new AppError(
        400,
        `Payment cannot be greater than outstanding balance of ₹${currentBalance}`
      );
    }

    return supplierLedgerRepository.create({
      supplier: {
        connect: {
          id: supplierId,
        },
      },

      date:
        data.date ?? new Date(),

      uniqueNumber:
        data.uniqueNumber?.trim() || null,

      invoiceNumber:
        data.invoiceNumber.trim(),

      type: "PAYMENT",

      debit: 0,

      credit: paymentAmount,

      paymentMethod:
        data.paymentMethod as PaymentMethod,

      notes:
        data.notes?.trim() || null,
    });
  }
}

export const supplierLedgerService =
  new SupplierLedgerService();