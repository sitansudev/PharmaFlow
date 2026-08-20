import { api } from "@/lib/api";

import type { CategoryResponse } from "@/types/category";

export const categoryService = {
  async getAll() {
    const response = await api.get<CategoryResponse>("/categories");
    return response.data;
  },

  async create(data: any) {
    const response = await api.post("/categories", data);
    return response.data;
  },

  async update(id: string, data: any) {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};