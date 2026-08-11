import { apiClient } from "./client";
import {
  InvoiceDto,
  CreateInvoiceInput,
  UpdateInvoiceStatusInput,
  PaginationQuery,
  ApiResponse
} from "@vanta/shared";

export const invoicesApi = {
  getInvoices: async (params?: PaginationQuery & { status?: string; customerId?: string }) => {
    return apiClient.get<any, ApiResponse<InvoiceDto[]>>("/invoices", { params });
  },

  getInvoiceById: async (id: string) => {
    return apiClient.get<any, ApiResponse<InvoiceDto>>(`/invoices/${id}`);
  },

  generateInvoice: async (data: CreateInvoiceInput) => {
    return apiClient.post<any, ApiResponse<InvoiceDto>>("/invoices/generate", data);
  },

  updateStatus: async (id: string, data: UpdateInvoiceStatusInput) => {
    return apiClient.patch<any, ApiResponse<InvoiceDto>>(`/invoices/${id}/status`, data);
  }
};
