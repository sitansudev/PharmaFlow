import { api } from "@/lib/api";

import type {
  PurchaseResponse,
  CreatePurchase,
} from "@/types/purchase";

export const purchaseService = {
  async getAll() {
    const response =
      await api.get<PurchaseResponse>("/purchases");

    return response.data;
  },

  async create(data: CreatePurchase) {
    const response =
      await api.post("/purchases", data);

    return response.data;
  },
};