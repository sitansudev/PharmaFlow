import { AppError } from "../../shared/errors/app-error";
import { hashPassword } from "../../shared/utils/password";
import { authRepository } from "./auth.repository";
import type { RegisterDTO } from "./auth.types";

export class AuthService {
  async register(data: RegisterDTO) {
    const existingUser = await authRepository.findByEmail(data.email);

    if (existingUser) {
      throw new AppError(409, "Email already exists");
    }

    const passwordHash = await hashPassword(data.password);

    const user = await authRepository.create({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      passwordHash,
    });

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    };
  }
}

export const authService = new AuthService();