import { AppError } from "../../shared/errors/app-error.js";
import { hashPassword } from "../../shared/utils/password.js";
import { authRepository } from "./auth.repository.js";
import type { RegisterDTO } from "./auth.types.js";
export class AuthService {
  async register(data: RegisterDTO) {
    const existingUser = await authRepository.findByEmail(data.email);

    if (existingUser) {
      throw new AppError(409, "Email already exists");
    }

const password = await hashPassword(data.password);

const user = await authRepository.create({
  fullName: data.fullName,
  email: data.email,
  phone: data.phone,
  password,
});

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    };
  }
}

export const authService = new AuthService();