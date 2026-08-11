import { Request, Response, NextFunction } from "express";
import { StockService } from "../services/stock.service.js";
import { sendCreated, sendSuccess } from "../utils/response.js";

export class StockController {
  static async getStockMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const productId = req.query.productId as string;
      const movementType = req.query.movementType as string;
      const search = req.query.search as string;

      const result = await StockService.getStockMovements(page, limit, productId, movementType, search);
      return sendSuccess(res, result.data, undefined, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async createStockMovement(req: Request, res: Response, next: NextFunction) {
    try {
      const movement = await StockService.createStockMovement(req.body, req.user!.id);
      return sendCreated(res, movement, "Stock movement recorded and inventory updated");
    } catch (error) {
      next(error);
    }
  }
}
