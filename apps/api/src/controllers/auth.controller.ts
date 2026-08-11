import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import { sendSuccess } from "../utils/response.js";

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      return sendSuccess(res, result, "Login successful");
    } catch (error) {
      next(error);
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
