import { prisma } from "../../database/prisma.js";
export class AuthRepository {
    async findByEmail(email) {
        return prisma.user.findUnique({
            where: { email },
        });
    }
    async findById(id) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async create(data) {
        return prisma.user.create({
            data,
        });
    }
}
export const authRepository = new AuthRepository();
//# sourceMappingURL=auth.repository.js.map