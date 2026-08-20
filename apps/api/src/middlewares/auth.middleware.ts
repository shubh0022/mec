import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";
import { verifyJwt, JwtPayload } from "../utils/jwt.js";
import { prisma } from "../config/prisma.js";
import { Role, Permission, hasPermission, hasAnyPermission } from "@vanta/shared";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload & { id: string };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authentication token is missing. Format: Bearer <token>");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new UnauthorizedError("Authentication token is empty");
    }

    let decoded: JwtPayload;
    try {
      decoded = verifyJwt(token);
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        throw new UnauthorizedError("Your session has expired. Please sign in again.");
      }
      throw new UnauthorizedError("Invalid authentication token. Please sign in again.");
    }

    // Verify user exists and is active in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      throw new UnauthorizedError("User account not found");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Your account has been deactivated. Please contact an administrator.");
    }

    req.user = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role as Role,
      name: user.name,
      isGuest: user.role === Role.GUEST || decoded.isGuest === true
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("User must be authenticated before authorization check"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Forbidden: Role '${req.user.role}' is not authorized to access this resource. Allowed roles: [${allowedRoles.join(", ")}]`
        )
      );
    }

    next();
  };
};

export const requirePermission = (...permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("User must be authenticated before permission check"));
    }

    const allowed = hasAnyPermission(req.user.role, permissions);
    if (!allowed) {
      return next(
        new ForbiddenError(
          `Forbidden: You do not have the required permissions [${permissions.join(", ")}] to perform this action.`
        )
      );
    }

    next();
  };
};

/**
 * Middleware preventing guest accounts from executing mutating actions on business entities
 */
export const protectReadOnlyGuest = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === Role.GUEST) {
    const mutatingMethods = ["POST", "PUT", "PATCH", "DELETE"];
    if (mutatingMethods.includes(req.method.toUpperCase())) {
      return next(
        new ForbiddenError(
          "Guest demo mode is strictly read-only. Modifying, creating, or deleting records is prohibited in demo mode."
        )
      );
    }
  }
  next();
};
