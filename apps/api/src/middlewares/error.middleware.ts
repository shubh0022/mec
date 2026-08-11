import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AppError } from "../utils/errors.js";
import { sendError } from "../utils/response.js";
import { ERROR_CODES, HTTP_STATUS } from "@vanta/shared";

export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): any => {
  // Known operational AppError
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.code, err.errors);
  }

  // Prisma unique constraint violation (P2002)
  if (err?.code === "P2002") {
    const target = err?.meta?.target ? ` (${Array.isArray(err.meta.target) ? err.meta.target.join(", ") : err.meta.target})` : "";
    return sendError(
      res,
      `A unique constraint violation occurred${target}. Value already exists.`,
      HTTP_STATUS.CONFLICT,
      ERROR_CODES.CONFLICT
    );
  }

  // Prisma record not found (P2025)
  if (err?.code === "P2025") {
    return sendError(
      res,
      "The requested record was not found or has been removed.",
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  // JWT errors
  if (err?.name === "JsonWebTokenError") {
    return sendError(res, "Invalid authentication token.", HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
  }
  if (err?.name === "TokenExpiredError") {
    return sendError(res, "Authentication token has expired.", HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
  }

  // Syntax / parsing errors
  if (err instanceof SyntaxError && "body" in err) {
    return sendError(res, "Malformed JSON in request body.", HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
  }

  // Unhandled / server errors
  console.error("Unhandled Internal Server Error:", err);

  const message = process.env.NODE_ENV === "production"
    ? "An unexpected internal server error occurred."
    : err.message || "An unexpected error occurred.";

  return sendError(
    res,
    message,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    ERROR_CODES.INTERNAL_SERVER_ERROR
  );
};
