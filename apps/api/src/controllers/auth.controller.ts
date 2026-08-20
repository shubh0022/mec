import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import { sendSuccess } from "../utils/response.js";
import { env } from "../config/env.js";

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      return sendSuccess(res, result, "Authentication successful");
    } catch (error) {
      next(error);
    }
  }

  static async guestLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.guestLogin();
      return sendSuccess(res, result, "Guest demonstration session created");
    } catch (error) {
      next(error);
    }
  }

  static async getGoogleAuthUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const result = AuthService.getGoogleAuthUrl();
      return sendSuccess(res, result, "Google OAuth URL generated");
    } catch (error) {
      next(error);
    }
  }

  static async verifyGoogleIdToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { credential } = req.body;
      const result = await AuthService.verifyGoogleIdToken(credential);
      return sendSuccess(res, result, "Google authentication successful");
    } catch (error) {
      next(error);
    }
  }

  static async handleGoogleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const code = req.query.code as string;
      const state = req.query.state as string;

      if (!code) {
        return res.redirect(`${env.FRONTEND_URL}/login?error=${encodeURIComponent("Google authorization code missing")}`);
      }

      const result = await AuthService.handleGoogleOAuthCallback(code, state);
      // Redirect to frontend auth callback route with token
      return res.redirect(
        `${env.FRONTEND_URL}/auth/callback?token=${encodeURIComponent(result.token)}`
      );
    } catch (error: any) {
      const errorMessage = error?.message || "Google sign-in could not be completed";
      return res.redirect(
        `${env.FRONTEND_URL}/login?error=${encodeURIComponent(errorMessage)}`
      );
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getMe(req.user!.id);
      return sendSuccess(res, user, "User profile retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, { message: "Successfully logged out" }, "Logout successful");
    } catch (error) {
      next(error);
    }
  }
}
