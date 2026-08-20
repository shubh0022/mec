import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { UnauthorizedError, ForbiddenError, BadRequestError } from "../utils/errors.js";
import { signJwt } from "../utils/jwt.js";
import { LoginInput, Role, UserDto, AuthSessionDto, GoogleVerifiedIdentity } from "@vanta/shared";
import { AuditService } from "./audit.service.js";
import crypto from "crypto";

const googleClient = new OAuth2Client({
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  redirectUri: env.GOOGLE_CALLBACK_URL
});

export class AuthService {
  /**
   * Primary Email + Password Authentication
   */
  static async login(input: LoginInput): Promise<AuthSessionDto> {
    const normalizedEmail = input.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    // Generic rejection to avoid username enumeration
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError("Email or password is incorrect");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Your account has been deactivated. Please contact an administrator.");
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError("Email or password is incorrect");
    }

    const token = signJwt({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
      name: user.name,
      isGuest: user.role === Role.GUEST
    });

    // Log login audit
    AuditService.logAction({
      userId: user.id,
      action: "LOGIN",
      entity: "User",
      entityId: user.id,
      metadata: { email: user.email, role: user.role, method: "PASSWORD" }
    }).catch(console.error);

    const userDto: UserDto = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as Role,
      isActive: user.isActive,
      avatarUrl: user.avatarUrl,
      googleSubjectId: user.googleSubjectId,
      isGuest: user.role === Role.GUEST,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return {
      token,
      user: userDto,
      isGuest: false,
      expiresIn: env.JWT_EXPIRES_IN || "7d"
    };
  }

  /**
   * Continue as Guest / Demo Authentication
   * Issues a short-lived token with strict read-only Role.GUEST
   */
  static async guestLogin(): Promise<AuthSessionDto> {
    // Find or provision the dedicated guest demo user
    let guestUser = await prisma.user.findUnique({
      where: { email: "guest@vanta.local" }
    });

    if (!guestUser) {
      guestUser = await prisma.user.create({
        data: {
          name: "Guest Explorer",
          email: "guest@vanta.local",
          passwordHash: null,
          role: Role.GUEST,
          isActive: true
        }
      });
    }

    const token = signJwt(
      {
        userId: guestUser.id,
        email: guestUser.email,
        role: Role.GUEST,
        name: guestUser.name,
        isGuest: true
      },
      { expiresIn: (env.GUEST_JWT_EXPIRES_IN || "1h") as any }
    );

    AuditService.logAction({
      userId: guestUser.id,
      action: "GUEST_LOGIN",
      entity: "User",
      entityId: guestUser.id,
      metadata: { role: Role.GUEST, scope: "READ_ONLY_DEMO" }
    }).catch(console.error);

    const userDto: UserDto = {
      id: guestUser.id,
      name: guestUser.name,
      email: guestUser.email,
      role: Role.GUEST,
      isActive: true,
      avatarUrl: null,
      googleSubjectId: null,
      isGuest: true,
      createdAt: guestUser.createdAt,
      updatedAt: guestUser.updatedAt
    };

    return {
      token,
      user: userDto,
      isGuest: true,
      expiresIn: env.GUEST_JWT_EXPIRES_IN || "1h"
    };
  }

  /**
   * Generate official Google OAuth authorization URL
   */
  static getGoogleAuthUrl(): { url: string; state: string } {
    if (!env.GOOGLE_CLIENT_ID) {
      throw new BadRequestError("Google OAuth is not configured on this server (missing GOOGLE_CLIENT_ID)");
    }

    const state = crypto.randomBytes(24).toString("hex");

    const url = googleClient.generateAuthUrl({
      access_type: "offline",
      scope: ["openid", "email", "profile"],
      prompt: "select_account",
      state
    });

    return { url, state };
  }

  /**
   * Server-side verification of Google Identity token credential
   * Applies Option A enterprise policy: un-provisioned Google accounts are blocked.
   */
  static async verifyGoogleIdToken(idToken: string): Promise<AuthSessionDto> {
    if (!env.GOOGLE_CLIENT_ID) {
      throw new BadRequestError("Google OAuth is not configured on this server");
    }

    let identity: GoogleVerifiedIdentity;

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.sub || !payload.email) {
        throw new UnauthorizedError("Google authentication failed. Identity payload is invalid.");
      }

      identity = {
        sub: payload.sub,
        email: payload.email.toLowerCase().trim(),
        name: payload.name || payload.email.split("@")[0],
        picture: payload.picture,
        emailVerified: payload.email_verified === true
      };
    } catch (err: any) {
      // Fallback verification against Google's public tokeninfo endpoint if client library encounters network/version skew
      try {
        const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
        if (!res.ok) {
          throw new Error("Invalid token");
        }
        const data: any = await res.json();
        if (data.aud !== env.GOOGLE_CLIENT_ID || !data.sub || !data.email) {
          throw new Error("Audience mismatch or missing identity");
        }
        identity = {
          sub: data.sub,
          email: data.email.toLowerCase().trim(),
          name: data.name || data.email.split("@")[0],
          picture: data.picture,
          emailVerified: data.email_verified === "true" || data.email_verified === true
        };
      } catch {
        throw new UnauthorizedError("Google authentication failed. We could not verify your identity token.");
      }
    }

    if (!identity.emailVerified) {
      throw new UnauthorizedError("Google account email is not verified. Please verify your email with Google.");
    }

    // Look up user by googleSubjectId or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleSubjectId: identity.sub },
          { email: identity.email }
        ]
      }
    });

    // OPTION A ENTERPRISE POLICY: Unregistered Google users cannot gain access
    if (!user) {
      throw new ForbiddenError(
        "Your Google account is not registered with VANTA ERP. Please contact an administrator to provision access."
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Your account has been deactivated. Please contact an administrator.");
    }

    // Link googleSubjectId and avatar if not yet linked
    if (!user.googleSubjectId || (!user.avatarUrl && identity.picture)) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleSubjectId: user.googleSubjectId || identity.sub,
          avatarUrl: user.avatarUrl || identity.picture
        }
      });
    }

    // Maintain existing server-side role. Never escalate or allow client role selection.
    const token = signJwt({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
      name: user.name,
      isGuest: user.role === Role.GUEST
    });

    AuditService.logAction({
      userId: user.id,
      action: "GOOGLE_LOGIN",
      entity: "User",
      entityId: user.id,
      metadata: { email: user.email, googleSubjectId: identity.sub, role: user.role }
    }).catch(console.error);

    const userDto: UserDto = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as Role,
      isActive: user.isActive,
      avatarUrl: user.avatarUrl,
      googleSubjectId: user.googleSubjectId,
      isGuest: user.role === Role.GUEST,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return {
      token,
      user: userDto,
      isGuest: user.role === Role.GUEST,
      expiresIn: env.JWT_EXPIRES_IN || "7d"
    };
  }

  /**
   * Handle OAuth2 Authorization Code Exchange
   */
  static async handleGoogleOAuthCallback(code: string, state?: string): Promise<AuthSessionDto> {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      throw new BadRequestError("Google OAuth credentials are not configured on server");
    }

    try {
      const { tokens } = await googleClient.getToken(code);
      if (!tokens.id_token) {
        throw new UnauthorizedError("No ID token returned by Google authorization server");
      }

      return await this.verifyGoogleIdToken(tokens.id_token);
    } catch (err: any) {
      if (err instanceof ForbiddenError || err instanceof UnauthorizedError) {
        throw err;
      }
      throw new UnauthorizedError("Google sign-in could not be completed. Please try again.");
    }
  }

  /**
   * Fetch Authenticated User Profile
   */
  static async getMe(userId: string): Promise<UserDto> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError("User account not found or is currently deactivated");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as Role,
      isActive: user.isActive,
      avatarUrl: user.avatarUrl,
      googleSubjectId: user.googleSubjectId,
      isGuest: user.role === Role.GUEST,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
