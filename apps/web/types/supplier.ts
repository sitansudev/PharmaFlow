export interface Supplier {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  panNo?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierResponse {
  success: boolean;
  data: Supplier[];
}

export type SupplierLedgerEntryType =
  | "PURCHASE"
  | "PAYMENT";

export type SupplierPaymentMethod =
  | "CASH"
  | "UPI"
  | "CARD"
  | "ESEWA"
  | "FONEPAY";

export interface SupplierLedgerEntry {
  id: string;
  date: string;
  uniqueNumber: string | null;
  invoiceNumber: string;
  type: SupplierLedgerEntryType;
  debit: number;
  credit: number;
  balance: number;
  paymentMethod: SupplierPaymentMethod | null;
  referenceId: string | null;
  notes: string | null;
}

export interface SupplierLedgerTotals {
  debit: number;
  credit: number;
  balance: number;
}

export interface SupplierLedgerResponse {
  success: boolean;
  data: {
    supplier: Supplier;
    entries: SupplierLedgerEntry[];
    totals: SupplierLedgerTotals;
  };
}