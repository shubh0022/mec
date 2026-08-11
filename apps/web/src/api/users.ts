import { apiClient } from "./client";
import { UserDto, CreateUserInput, UpdateUserInput, ApiResponse } from "@vanta/shared";

export const usersApi = {
  getUsers: (params?: { page?: number; limit?: number; search?: string; role?: string }): Promise<ApiResponse<UserDto[]>> =>
    apiClient.get("/users", { params }),

  createUser: (data: CreateUserInput): Promise<ApiResponse<UserDto>> =>
    apiClient.post("/users", data),

  updateUser: (id: string, data: UpdateUserInput): Promise<ApiResponse<UserDto>> =>
    apiClient.patch(`/users/${id}`, data)
};
