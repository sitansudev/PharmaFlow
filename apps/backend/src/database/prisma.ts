import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const isProduction =
  process.env.NODE_ENV === "production";

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: isProduction
      ? ["warn", "error"]
      : ["query", "warn", "error"],
  });

if (!isProduction) {
  global.prisma = prisma;
}