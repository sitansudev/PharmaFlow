import { Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma.js";

export interface CreateAuditLogDTO {
  userId?: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: Prisma.InputJsonValue;
  newValue?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
}

export const auditRepository = {
  async create(data: CreateAuditLogDTO) {
    return prisma.auditLog.create({
      data: {
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        oldValue: data.oldValue,
        newValue: data.newValue,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,

        ...(data.userId && {
          user: {
            connect: {
              id: data.userId,
            },
          },
        }),
      },
    });
  },

  async findAll() {
    return prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },
};