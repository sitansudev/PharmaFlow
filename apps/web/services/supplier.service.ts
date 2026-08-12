import { api } from "@/lib/api";

import type {
  SupplierResponse,
  SupplierLedgerResponse,
} from "@/types/supplier";

export const supplierService = {
  async getAll() {
    const response =
      await api.get<SupplierResponse>("/suppliers");

    return response.data;
  },

  async create(data: any) {
    const response =
      await api.post("/suppliers", data);

    return response.data;
  },

  async update(id: string, data: any) {
    const response =
      await api.put(`/suppliers/${id}`, data);

    return response.data;
  },

  async delete(id: string) {
    const response =
      await api.delete(`/suppliers/${id}`);

    return response.data;
  },

  async getLedger(id: string) {
    const response =
      await api.get<SupplierLedgerResponse>(
        `/suppliers/${id}/ledger`
      );

    return response.data;
  },

  async recordPayment(
    id: string,
    data: {
      date?: string;
      uniqueNumber?: string;
      invoiceNumber: string;
      amount: number;
      paymentMethod:
        | "CASH"
        | "UPI"
        | "CARD"
        | "ESEWA"
        | "FONEPAY";
      notes?: string;
    }
  ) {
    const response = await api.post(
      `/suppliers/${id}/ledger/payment`,
      data
    );

    return response.data;
  },
};