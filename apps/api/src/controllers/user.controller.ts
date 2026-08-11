import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service.js";
import { sendCreated, sendSuccess } from "../utils/response.js";

export class UserController {
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const search = req.query.search as string;
      const role = req.query.role as string;

      const result = await UserService.getUsers(page, limit, search, role);
      return sendSuccess(res, result.data, undefined, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.createUser(req.body, req.user!.id);
      return sendCreated(res, user, "User created successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = await UserService.updateUser(id, req.body, req.user!.id);
      return sendSuccess(res, user, "User updated successfully");
    } catch (error) {
      next(error);
    }
  }
}
