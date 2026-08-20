import { ERROR_CODES, HTTP_STATUS } from "@vanta/shared";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly errors?: any[];

  constructor(message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR, code: string = ERROR_CODES.INTERNAL_SERVER_ERROR, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed", errors?: any[]) {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, errors);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Bad request", errors?: any[]) {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access denied: insufficient permissions") {
    super(message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Conflict with current state", code: string = ERROR_CODES.CONFLICT, errors?: any[]) {
    super(message, HTTP_STATUS.CONFLICT, code, errors);
  }
}

export class InsufficientStockError extends ConflictError {
  constructor(message: string, errors?: any[]) {
    super(message, ERROR_CODES.INSUFFICIENT_STOCK, errors);
  }
}
