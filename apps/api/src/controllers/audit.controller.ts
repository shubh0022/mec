import { Request, Response, NextFunction } from "express";
import { AuditService } from "../services/audit.service.js";
import { sendSuccess } from "../utils/response.js";

export class AuditController {
  static async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;

      const result = await AuditService.getLogs(page, limit);
      return sendSuccess(res, result.data, undefined, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }
}
