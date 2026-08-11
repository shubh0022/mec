import { Request, Response, NextFunction } from "express";
import { CustomerService } from "../services/customer.service.js";
import { sendCreated, sendSuccess } from "../utils/response.js";

export class CustomerController {
  static async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const customerType = req.query.customerType as string;

      const result = await CustomerService.getCustomers(page, limit, search, status, customerType);
      return sendSuccess(res, result.data, undefined, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const customer = await CustomerService.getCustomerById(id);
      return sendSuccess(res, customer);
    } catch (error) {
      next(error);
    }
  }

  static async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.createCustomer(req.body, req.user!.id);
      return sendCreated(res, customer, "Customer created successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const customer = await CustomerService.updateCustomer(id, req.body, req.user!.id);
      return sendSuccess(res, customer, "Customer updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async deleteCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await CustomerService.deleteCustomer(id, req.user!.id);
      return sendSuccess(res, result, "Customer deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getFollowUps(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const followUps = await CustomerService.getFollowUps(id);
      return sendSuccess(res, followUps);
    } catch (error) {
      next(error);
    }
  }

  static async createFollowUp(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const followUp = await CustomerService.createFollowUp(id, req.body, req.user!.id);
      return sendCreated(res, followUp, "Follow-up recorded successfully");
    } catch (error) {
      next(error);
    }
  }
}
