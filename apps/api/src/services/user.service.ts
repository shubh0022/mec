import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { CreateUserInput, UpdateUserInput, Role, UserDto } from "@vanta/shared";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import { AuditService } from "./audit.service.js";

export class UserService {
  static async getUsers(page: number = 1, limit: number = 20, search?: string, role?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }

    if (role) {
      where.role = role;
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      })
    ]);

    return {
      data: users as UserDto[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async createUser(input: CreateUserInput, currentAdminId: string): Promise<UserDto> {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() }
    });

    if (existing) {
      throw new ConflictError(`User with email '${input.email}' already exists`);
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email: input.email.toLowerCase().trim(),
        passwordHash,
        role: input.role,
        isActive: input.isActive ?? true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    AuditService.logAction({
      userId: currentAdminId,
      action: "USER_CREATED",
      entity: "User",
      entityId: user.id,
      metadata: { email: user.email, role: user.role }
    }).catch(console.error);

    return user as UserDto;
  }

  static async updateUser(id: string, input: UpdateUserInput, currentAdminId: string): Promise<UserDto> {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`User with ID '${id}' not found`);
    }

    const updateData: any = {};
    if (input.name) updateData.name = input.name.trim();
    if (input.role) updateData.role = input.role;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    if (input.password) {
      updateData.passwordHash = await bcrypt.hash(input.password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    AuditService.logAction({
      userId: currentAdminId,
      action: "USER_UPDATED",
      entity: "User",
      entityId: updated.id,
      metadata: { fields: Object.keys(updateData) }
    }).catch(console.error);

    return updated as UserDto;
  }
}
