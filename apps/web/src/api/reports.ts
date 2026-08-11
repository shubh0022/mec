import { apiClient } from "./client";
import { StockReportDto, SalesReportDto, ApiResponse } from "@vanta/shared";

export const reportsApi = {
  getStockReport: async (params?: { warehouseId?: string; categoryId?: string }) => {
    return apiClient.get<any, ApiResponse<StockReportDto>>("/reports/stock", { params });
  },

  getSalesReport: async (params?: { startDate?: string; endDate?: string }) => {
    return apiClient.get<any, ApiResponse<SalesReportDto>>("/reports/sales", { params });
  }
};
