import { Response } from "express";
import { ApiResponse, PaginationMeta } from "@vanta/shared";

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200,
  pagination?: PaginationMeta
) => {
  const payload: ApiResponse<T> = {
    success: true,
    ...(data !== undefined ? { data } : {}),
    ...(message ? { message } : {}),
    ...(pagination ? { pagination } : {})
  };
  return res.status(statusCode).json(payload);
};

export const sendCreated = <T>(res: Response, data: T, message: string = "Resource created successfully") => {
  return sendSuccess(res, data, message, 201);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  code: string = "INTERNAL_SERVER_ERROR",
  errors?: any[]
) => {
  const payload: ApiResponse = {
    success: false,
    message,
    code,
    ...(errors ? { errors } : {})
  };
  return res.status(statusCode).json(payload);
};
