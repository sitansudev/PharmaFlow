import { api } from "@/lib/api";

import type { MedicineResponse } from "@/types/medicine";

export const medicineService = {
  async getAll(
  limit = 10,
  search = "",
  page = 1
) {
  const response = await api.get<MedicineResponse>(
    "/medicines",
    {
      params: {
        limit,
        page,
        ...(search.trim()
          ? { search: search.trim() }
          : {}),
      },
    }
  );

  return response.data;
},

  async create(data: any) {
    const response = await api.post("/medicines", data);

    return response.data;
  },

  async update(id: string, data: any) {
    const response = await api.put(
      `/medicines/${id}`,
      data
    );

    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(
      `/medicines/${id}`
    );

    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(
      `/medicines/${id}`
    );

    return response.data;
  },
};