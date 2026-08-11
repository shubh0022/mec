import { Request, Response, NextFunction } from "express";
import { InvoiceService } from "../services/invoice.service.js";
import { sendCreated, sendSuccess } from "../utils/response.js";

export class InvoiceController {
  static async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const status = req.query.status as string;
      const customerId = req.query.customerId as string;
      const search = req.query.search as string;

      const result = await InvoiceService.getInvoices(page, limit, status, customerId, search);
      return sendSuccess(res, result.data, undefined, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getInvoiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const invoice = await InvoiceService.getInvoiceById(id);
      return sendSuccess(res, invoice);
    } catch (error) {
      next(error);
    }
  }

  static async generateInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await InvoiceService.generateFromChallan(req.body, req.user!.id);
      return sendCreated(res, invoice, `Tax invoice ${invoice.invoiceNumber} generated successfully`);
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const invoice = await InvoiceService.updateStatus(id, req.body, req.user!.id);
      return sendSuccess(res, invoice, `Invoice ${invoice.invoiceNumber} status updated to ${invoice.status}`);
    } catch (error) {
      next(error);
    }
  }
}
