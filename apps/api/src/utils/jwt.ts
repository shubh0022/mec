import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import { Role } from "@vanta/shared";

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
  isGuest?: boolean;
}

export const signJwt = (payload: JwtPayload, options?: SignOptions): string => {
  const defaultExpiry = payload.isGuest
    ? env.GUEST_JWT_EXPIRES_IN || "1h"
    : env.JWT_EXPIRES_IN || "7d";

  const opts: SignOptions = {
    expiresIn: defaultExpiry as any,
    ...options
  };
  return jwt.sign(payload, env.JWT_SECRET, opts);
};

export const verifyJwt = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};
