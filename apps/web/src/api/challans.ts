import { apiClient } from "./client";
import {
  SalesChallanDto,
  CreateSalesChallanInput,
  UpdateSalesChallanInput,
  ApiResponse
} from "@vanta/shared";

export const challansApi = {
  getChallans: (params?: { page?: number; limit?: number; status?: string; customerId?: string; search?: string }): Promise<ApiResponse<SalesChallanDto[]>> =>
    apiClient.get("/challans", { params }),

  getChallanById: (id: string): Promise<ApiResponse<SalesChallanDto>> =>
    apiClient.get(`/challans/${id}`),

  createChallan: (data: CreateSalesChallanInput): Promise<ApiResponse<SalesChallanDto>> =>
    apiClient.post("/challans", data),

  updateChallan: (id: string, data: UpdateSalesChallanInput): Promise<ApiResponse<SalesChallanDto>> =>
    apiClient.patch(`/challans/${id}`, data),

  confirmChallan: (id: string): Promise<ApiResponse<SalesChallanDto>> =>
    apiClient.post(`/challans/${id}/confirm`),

  cancelChallan: (id: string): Promise<ApiResponse<SalesChallanDto>> =>
    apiClient.post(`/challans/${id}/cancel`)
};
