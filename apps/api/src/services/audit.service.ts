import { prisma } from "../config/prisma.js";

export interface LogActionParams {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: any;
}

export class AuditService {
  static async logAction(params: LogActionParams) {
    try {
      return await prisma.auditLog.create({
        data: {
          userId: params.userId,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          metadata: params.metadata ? JSON.stringify(params.metadata) : null
        }
      });
    } catch (err) {
      console.error("Audit log recording failed:", err);
      return null;
    }
  }

  static async getLogs(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [total, logs] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      })
    ]);

    return {
      data: logs.map((log) => ({
        ...log,
        metadata: log.metadata ? JSON.parse(log.metadata) : null
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
