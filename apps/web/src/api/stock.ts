import { apiClient } from "./client";
import { StockMovementDto, CreateStockMovementInput, ApiResponse } from "@vanta/shared";

export const stockApi = {
  getStockMovements: (params?: { page?: number; limit?: number; productId?: string; movementType?: string; search?: string }): Promise<ApiResponse<StockMovementDto[]>> =>
    apiClient.get("/stock/movements", { params }),

  createStockMovement: (data: CreateStockMovementInput): Promise<ApiResponse<StockMovementDto>> =>
    apiClient.post("/stock/movements", data)
};
