import { api } from "@/lib/api";

import type {
  CustomerResponse,
  SingleCustomerResponse,
  CreateCustomerInput,
  UpdateCustomerInput,
} from "@/types/customer";

export const customerService = {
  async getAll() {
    const response =
      await api.get<CustomerResponse>("/customers");

    return response.data;
  },

  async getById(id: string) {
    const response =
      await api.get<SingleCustomerResponse>(
        `/customers/${id}`
      );

    return response.data;
  },

  async create(data: CreateCustomerInput) {
    const response =
      await api.post<SingleCustomerResponse>(
        "/customers",
        data
      );

    return response.data;
  },

  async update(
    id: string,
    data: UpdateCustomerInput
  ) {
    const response =
      await api.put<SingleCustomerResponse>(
        `/customers/${id}`,
        data
      );

    return response.data;
  },

  async delete(id: string) {
    const response =
      await api.delete<{ success: boolean }>(
        `/customers/${id}`
      );

    return response.data;
  },
  async recordPayment(
  id: string,
  amount: string
) {
  const response =
    await api.post<SingleCustomerResponse>(
      `/customers/${id}/payment`,
      { amount }
    );

  return response.data;
},
};
