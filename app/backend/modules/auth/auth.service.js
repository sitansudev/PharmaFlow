import { AppError } from "../../shared/errors/app-error.js";
import { comparePassword, hashPassword } from "../../shared/utils/password.js";
import { generateToken } from "../../shared/utils/jwt.js";
import { authRepository } from "./auth.repository.js";
export class AuthService {
    async register(data) {
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
    async login(data) {
        const user = await authRepository.findByEmail(data.email);
        if (!user) {
            throw new AppError(401, "Invalid email or password");
        }
        const isPasswordValid = await comparePassword(data.password, user.password);
        if (!isPasswordValid) {
            throw new AppError(401, "Invalid email or password");
        }
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        return {
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
            token,
        };
    }
    async getProfile(userId) {
        const user = await authRepository.findById(userId);
        if (!user) {
            throw new AppError(404, "User not found");
        }
        return user;
    }
}
export const authService = new AuthService();
//# sourceMappingURL=auth.service.js.map