import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";
import { verifyJwt, JwtPayload } from "../utils/jwt.js";
import { prisma } from "../config/prisma.js";
import { Role } from "@vanta/shared";

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

    const decoded = verifyJwt(token);

    // Verify user exists and is active in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError("User account not found or is currently deactivated");
    }

    req.user = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role as Role,
      name: user.name
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
