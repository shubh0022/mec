import { Request, Response, NextFunction } from "express";
import { ReportService } from "../services/report.service.js";
import { sendSuccess } from "../utils/response.js";

export class ReportController {
  static async getStockReport(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouseId = req.query.warehouseId as string;
      const categoryId = req.query.categoryId as string;
      const report = await ReportService.getStockReport(warehouseId, categoryId);
      return sendSuccess(res, report, "Stock valuation report generated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getSalesReport(req: Request, res: Response, next: NextFunction) {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const report = await ReportService.getSalesReport(startDate, endDate);
      return sendSuccess(res, report, "Sales revenue report generated successfully");
    } catch (error) {
      next(error);
    }
  }
}
