import { apiClient } from "./client";
import { LoginInput, UserDto, ApiResponse, AuthSessionDto } from "@vanta/shared";

export const authApi = {
  login: (data: LoginInput): Promise<ApiResponse<AuthSessionDto>> =>
    apiClient.post("/auth/login", data),

  guestLogin: (): Promise<ApiResponse<AuthSessionDto>> =>
    apiClient.post("/auth/guest"),

  verifyGoogle: (credential: string): Promise<ApiResponse<AuthSessionDto>> =>
    apiClient.post("/auth/google/verify", { credential }),

  getGoogleAuthUrl: (): Promise<ApiResponse<{ url: string; state: string }>> =>
    apiClient.get("/auth/google"),

  getMe: (): Promise<ApiResponse<UserDto>> =>
    apiClient.get("/auth/me"),

  logout: (): Promise<ApiResponse<{ message: string }>> =>
    apiClient.post("/auth/logout")
};
