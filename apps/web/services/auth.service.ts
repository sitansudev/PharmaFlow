import { api } from "@/lib/api";
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "@/types/auth";

export const authService = {
  async login(data: LoginRequest) {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  },
  async register(data: RegisterRequest) {
    const response = await api.post<RegisterResponse>("/auth/register", data);
    return response.data;
  },
};
