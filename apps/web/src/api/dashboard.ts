import { apiClient } from "./client";
import { DashboardSummaryDto, ApiResponse } from "@vanta/shared";

export const dashboardApi = {
  getSummary: (): Promise<ApiResponse<DashboardSummaryDto>> =>
    apiClient.get("/dashboard/summary")
};
