import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service.js";
import { sendCreated, sendSuccess } from "../utils/response.js";

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const search = req.query.search as string;
      const categoryId = req.query.categoryId as string;
      const lowStockOnly = req.query.lowStock === "true";

      const result = await ProductService.getProducts(page, limit, search, categoryId, lowStockOnly);
      return sendSuccess(res, result.data, undefined, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const product = await ProductService.getProductById(id);
      return sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.createProduct(req.body, req.user!.id);
      return sendCreated(res, product, "Product created successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const product = await ProductService.updateProduct(id, req.body, req.user!.id);
      return sendSuccess(res, product, "Product updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await ProductService.getCategories();
      return sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  }

  static async getWarehouses(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouses = await ProductService.getWarehouses();
      return sendSuccess(res, warehouses);
    } catch (error) {
      next(error);
    }
  }
}
