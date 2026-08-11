import { apiClient } from "./client";
import {
  CustomerDto,
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerFollowUpDto,
  CreateFollowUpInput,
  ApiResponse
} from "@vanta/shared";

export const customersApi = {
  getCustomers: (params?: { page?: number; limit?: number; search?: string; status?: string; customerType?: string }): Promise<ApiResponse<CustomerDto[]>> =>
    apiClient.get("/customers", { params }),

  getCustomerById: (id: string): Promise<ApiResponse<CustomerDto>> =>
    apiClient.get(`/customers/${id}`),

  createCustomer: (data: CreateCustomerInput): Promise<ApiResponse<CustomerDto>> =>
    apiClient.post("/customers", data),

  updateCustomer: (id: string, data: UpdateCustomerInput): Promise<ApiResponse<CustomerDto>> =>
    apiClient.patch(`/customers/${id}`, data),

  deleteCustomer: (id: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient.delete(`/customers/${id}`),

  getFollowUps: (customerId: string): Promise<ApiResponse<CustomerFollowUpDto[]>> =>
    apiClient.get(`/customers/${customerId}/follow-ups`),

  createFollowUp: (customerId: string, data: CreateFollowUpInput): Promise<ApiResponse<CustomerFollowUpDto>> =>
    apiClient.post(`/customers/${customerId}/follow-ups`, data)
};
