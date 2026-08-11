import { Request, Response, NextFunction } from "express";
import { ChallanService } from "../services/challan.service.js";
import { sendCreated, sendSuccess } from "../utils/response.js";

export class ChallanController {
  static async getChallans(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const status = req.query.status as string;
      const customerId = req.query.customerId as string;
      const search = req.query.search as string;

      const result = await ChallanService.getChallans(page, limit, status, customerId, search);
      return sendSuccess(res, result.data, undefined, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getChallanById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const challan = await ChallanService.getChallanById(id);
      return sendSuccess(res, challan);
    } catch (error) {
      next(error);
    }
  }

  static async createChallan(req: Request, res: Response, next: NextFunction) {
    try {
      const challan = await ChallanService.createChallan(req.body, req.user!.id);
      return sendCreated(res, challan, "Sales challan draft created successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updateChallan(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const challan = await ChallanService.updateChallan(id, req.body, req.user!.id);
      return sendSuccess(res, challan, "Sales challan updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async confirmChallan(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const challan = await ChallanService.confirmChallan(id, req.user!.id);
      return sendSuccess(res, challan, `Challan ${challan.challanNumber} confirmed and stock deducted successfully`);
    } catch (error) {
      next(error);
    }
  }

  static async cancelChallan(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const challan = await ChallanService.cancelChallan(id, req.user!.id);
      return sendSuccess(res, challan, `Challan ${challan.challanNumber} cancelled successfully`);
    } catch (error) {
      next(error);
    }
  }
}
