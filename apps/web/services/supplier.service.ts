import { api } from "@/lib/api";

import type { SupplierResponse } from "@/types/supplier";

export const supplierService = {
  async getAll() {
    const response = await api.get<SupplierResponse>("/suppliers");
    return response.data;
  },

  async create(data: any) {
    const response = await api.post("/suppliers", data);
    return response.data;
  },

  async update(id: string, data: any) {
    const response = await api.put(`/suppliers/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  },
};