import { prisma } from "../../database/prisma.js";
export const auditRepository = {
    async create(data) {
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
//# sourceMappingURL=audit.repository.js.map