import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { UnauthorizedError } from "../utils/errors.js";
import { signJwt } from "../utils/jwt.js";
import { LoginInput, Role, UserDto } from "@vanta/shared";
import { AuditService } from "./audit.service.js";

export class AuthService {
  static async login(input: LoginInput): Promise<{ token: string; user: UserDto }> {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() }
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Your account has been deactivated. Please contact an administrator.");
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = signJwt({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
      name: user.name
    });

    // Record login in audit log asynchronously
    AuditService.logAction({
      userId: user.id,
      action: "LOGIN",
      entity: "User",
      entityId: user.id,
      metadata: { email: user.email, role: user.role }
    }).catch(console.error);

    const userDto: UserDto = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as Role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return { token, user: userDto };
  }

  static async getMe(userId: string): Promise<UserDto> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError("User not found or deactivated");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as Role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
