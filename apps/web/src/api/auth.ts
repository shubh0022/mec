import { apiClient } from "./client";
import { LoginInput, UserDto, ApiResponse } from "@vanta/shared";

export const authApi = {
  login: (data: LoginInput): Promise<ApiResponse<{ token: string; user: UserDto }>> =>
    apiClient.post("/auth/login", data),

  getMe: (): Promise<ApiResponse<UserDto>> =>
    apiClient.get("/auth/me"),

  logout: (): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post("/auth/logout")
};
