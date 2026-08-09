import { api } from "@/lib/api";

import type {
  Sale,
  SaleResponse,
  CreateSaleInput,
} from "@/types/sale";

export const saleService = {
  async getAll() {
    const response =
      await api.get<SaleResponse>("/sales");

    return response.data;
  },

  async getById(id: string) {
    const response =
      await api.get<{
        success: boolean;
        data: Sale;
      }>(`/sales/${id}`);

    return response.data;
  },

  async create(data: CreateSaleInput) {
    const response =
      await api.post("/sales", data);

    return response.data;
  },
};