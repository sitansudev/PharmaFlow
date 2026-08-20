import { api } from "@/lib/api";

import type {
  MedicineResponse,
  CreateMedicine,
  UpdateMedicine,
  Medicine,
} from "@/types/medicine";

export const medicineService = {
  async getAll(
    limit = 10,
    search = "",
    page = 1
  ) {
    const response =
      await api.get<MedicineResponse>(
        "/medicines",
        {
          params: {
            limit,
            page,
            ...(search.trim()
              ? {
                  search: search.trim(),
                }
              : {}),
          },
        }
      );

    return response.data;
  },

  async create(
    data: CreateMedicine
  ) {
    const response =
      await api.post<{
        success: boolean;
        message: string;
        data: Medicine;
      }>("/medicines", data);

    return response.data;
  },

  async update(
    id: string,
    data: UpdateMedicine
  ) {
    const response =
      await api.put<{
        success: boolean;
        message: string;
        data: Medicine;
      }>(
        `/medicines/${id}`,
        data
      );

    return response.data;
  },

  async getById(id: string) {
    const response =
      await api.get<{
        success: boolean;
        data: Medicine;
      }>(
        `/medicines/${id}`
      );

    return response.data;
  },
    async getGroupedById(id: string) {
  const response =
    await api.get<{
      success: boolean;
      data: {
        name: string;
        genericName: string | null;
        category: Medicine["category"];
        medicines: Medicine[];
        totalStock: number;
        totalBatches: number;
        totalSuppliers: number;
      };
    }>(`/medicines/group/${id}`);

  return response.data;
},

  async delete(id: string) {
    const response =
      await api.delete<{
        success: boolean;
        message: string;
      }>(
        `/medicines/${id}`
      );

    return response.data;
  },
    async quickCreate(data: {
    name: string;
    genericName?: string;
    categoryId?: string;

    barcode?: string;
  }) {
    const response =
      await api.post<{
        success: boolean;
        message: string;
        data: Medicine;
      }>(
        "/medicines/quick",
        data
      );

    return response.data;
  },
};