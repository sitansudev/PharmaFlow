import { api } from "@/lib/api";
import type { LoginRequest, LoginResponse } from "@/types/auth";

export const authService = {
  async login(data: LoginRequest) {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  },
};