import { prisma } from "../../database/prisma.js";

export class AuthRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

 async create(data: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}) {
  return prisma.user.create({
    data,
  });
}
}
export const authRepository = new AuthRepository();