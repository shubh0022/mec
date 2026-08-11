import { apiClient } from "./client";
import {
  ProductDto,
  CreateProductInput,
  UpdateProductInput,
  CategoryDto,
  WarehouseDto,
  ApiResponse
} from "@vanta/shared";

export const productsApi = {
  getProducts: (params?: { page?: number; limit?: number; search?: string; categoryId?: string; lowStock?: boolean }): Promise<ApiResponse<ProductDto[]>> =>
    apiClient.get("/products", { params }),

  getProductById: (id: string): Promise<ApiResponse<ProductDto>> =>
    apiClient.get(`/products/${id}`),

  createProduct: (data: CreateProductInput): Promise<ApiResponse<ProductDto>> =>
    apiClient.post("/products", data),

  updateProduct: (id: string, data: UpdateProductInput): Promise<ApiResponse<ProductDto>> =>
    apiClient.patch(`/products/${id}`, data),

  getCategories: (): Promise<ApiResponse<CategoryDto[]>> =>
    apiClient.get("/products/meta/categories"),

  getWarehouses: (): Promise<ApiResponse<WarehouseDto[]>> =>
    apiClient.get("/products/meta/warehouses")
};
