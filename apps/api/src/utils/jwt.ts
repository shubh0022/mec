import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import { Role } from "@vanta/shared";

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
}

export const signJwt = (payload: JwtPayload, options?: SignOptions): string => {
  const opts: SignOptions = {
    expiresIn: (env.JWT_EXPIRES_IN || "7d") as any,
    ...options
  };
  return jwt.sign(payload, env.JWT_SECRET, opts);
};

export const verifyJwt = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};
