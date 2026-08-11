import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/dashboard.service.js";
import { sendSuccess } from "../utils/response.js";

export class DashboardController {
  static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await DashboardService.getSummary();
      return sendSuccess(res, summary, "Dashboard metrics retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
}
