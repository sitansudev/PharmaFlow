import { api } from "@/lib/api";
import type { DashboardResponse } from "@/types/dashboard";

export const dashboardService = {
  async getStats() {
    const response = await api.get<DashboardResponse>("/dashboard");

    return response.data;
  },
};