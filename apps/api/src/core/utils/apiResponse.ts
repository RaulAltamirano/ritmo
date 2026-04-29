/**
 * 🚀 RITMO API RESPONSE SYSTEM - 2025 BEST PRACTICES
 *
 * Standardized API response handling with modern patterns
 * Based on industry standards and best practices
 */

import { config } from '@ritmo/config'
import { Response } from 'express'

// Response status types
export type ResponseStatus = 'success' | 'error' | 'partial'

// Error codes for consistent error handling
export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  SESSION_INVALID = 'SESSION_INVALID',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // Resource Management
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',

  // Business Logic
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // System Errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

// Error detail interface
export interface ErrorDetail {
  field?: string
  message: string
  value?: any
  code?: string
}

// Base response interface
export interface ApiResponse<T = any> {
  success: boolean
  status: ResponseStatus
  data?: T
  error?: {
    code: ErrorCode | string
    message: string
    details?: ErrorDetail[]
    stack?: string
  }
  message?: string
  meta: {
    timestamp: string
    requestId?: string
    version?: string
    path?: string
    method?: string
    duration?: number
  }
}

// Success response builder
export class SuccessResponse<T = any> {
  private readonly response: ApiResponse<T>

  constructor(data: T, message?: string) {
    this.response = {
      success: true,
      status: 'success',
      data,
      message: message ?? 'Operation completed successfully',
      meta: {
        timestamp: new Date().toISOString(),
        version: config.api.version ?? '1.0.0',
      },
    }
  }

  withMeta(meta: Partial<ApiResponse<T>['meta']>): this {
    this.response.meta = { ...this.response.meta, ...meta }
    return this
  }

  withRequestId(requestId: string): this {
    this.response.meta.requestId = requestId
    return this
  }

  withDuration(duration: number): this {
    this.response.meta.duration = duration
    return this
  }

  build(): ApiResponse<T> {
    return this.response
  }

  send(res: Response, statusCode = 200): void {
    res.status(statusCode).json(this.build())
  }
}

// Error response builder
export class ErrorResponse {
  private readonly response: ApiResponse

  constructor(code: ErrorCode | string, message: string, details?: ErrorDetail[]) {
    this.response = {
      success: false,
      status: 'error',
      error: {
        code,
        message,
        details,
        ...(config.server.environment === 'development'
          ? {
              stack: new Error().stack,
            }
          : {}),
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: config.api.version ?? '1.0.0',
      },
    }
  }

  withMeta(meta: Partial<ApiResponse['meta']>): this {
    this.response.meta = { ...this.response.meta, ...meta }
    return this
  }

  withRequestId(requestId: string): this {
    this.response.meta.requestId = requestId
    return this
  }

  withPath(path: string): this {
    this.response.meta.path = path
    return this
  }

  withMethod(method: string): this {
    this.response.meta.method = method
    return this
  }

  build(): ApiResponse {
    return this.response
  }

  send(res: Response, statusCode = 400): void {
    res.status(statusCode).json(this.build())
  }
}

// Partial success response (for operations with mixed results)
export class PartialResponse<T = any> {
  private readonly response: ApiResponse<T>

  constructor(data: T, message: string, partialErrors?: ErrorDetail[]) {
    this.response = {
      success: true,
      status: 'partial',
      data,
      message,
      error: partialErrors
        ? {
            code: 'PARTIAL_SUCCESS',
            message: 'Operation completed with some issues',
            details: partialErrors,
          }
        : undefined,
      meta: {
        timestamp: new Date().toISOString(),
        version: config.api.version ?? '1.0.0',
      },
    }
  }

  withMeta(meta: Partial<ApiResponse<T>['meta']>): this {
    this.response.meta = { ...this.response.meta, ...meta }
    return this
  }

  build(): ApiResponse<T> {
    return this.response
  }

  send(res: Response, statusCode = 200): void {
    res.status(statusCode).json(this.build())
  }
}

// Utility functions for common responses
export const ApiResponses = {
  // Success responses
  ok: <T>(data: T, message?: string) => new SuccessResponse(data, message),
  created: <T>(data: T, message?: string) => new SuccessResponse(data, message),
  noContent: () => new SuccessResponse(null, 'No content'),

  // Error responses
  badRequest: (message: string, details?: ErrorDetail[]) =>
    new ErrorResponse(ErrorCode.VALIDATION_ERROR, message, details),

  error: (
    message: string,
    code: string = ErrorCode.INTERNAL_ERROR,
    details?: ErrorDetail[],
  ) => new ErrorResponse(code, message, details),

  unauthorized: (message = 'Authentication required') =>
    new ErrorResponse(ErrorCode.UNAUTHORIZED, message),

  forbidden: (message = 'Access denied') =>
    new ErrorResponse(ErrorCode.FORBIDDEN, message),

  notFound: (message = 'Resource not found') =>
    new ErrorResponse(ErrorCode.NOT_FOUND, message),

  conflict: (message = 'Resource conflict') =>
    new ErrorResponse(ErrorCode.RESOURCE_CONFLICT, message),

  internalError: (message = 'Internal server error') =>
    new ErrorResponse(ErrorCode.INTERNAL_ERROR, message),

  rateLimitExceeded: (message = 'Rate limit exceeded') =>
    new ErrorResponse(ErrorCode.RATE_LIMIT_EXCEEDED, message),

  // Prisma specific errors
  prismaError: (error: any) => {
    switch (error.code) {
      case 'P2002':
        return new ErrorResponse(
          ErrorCode.DUPLICATE_ENTRY,
          'A record with this information already exists',
          [{ message: 'Duplicate constraint violation' }],
        )
      case 'P2025':
        return new ErrorResponse(
          ErrorCode.NOT_FOUND,
          'The requested record was not found',
        )
      case 'P2003':
        return new ErrorResponse(
          ErrorCode.VALIDATION_ERROR,
          'Foreign key constraint violation',
        )
      default:
        return new ErrorResponse(ErrorCode.INTERNAL_ERROR, 'Database operation failed')
    }
  },

  // JWT specific errors
  jwtError: (error: any) => {
    switch (error.name) {
      case 'JsonWebTokenError':
        return new ErrorResponse(
          ErrorCode.INVALID_TOKEN,
          'Invalid authentication token',
        )
      case 'TokenExpiredError':
        return new ErrorResponse(
          ErrorCode.TOKEN_EXPIRED,
          'Authentication token has expired',
        )
      default:
        return new ErrorResponse(ErrorCode.UNAUTHORIZED, 'Authentication failed')
    }
  },
}

// Middleware for adding request metadata
export const addRequestMeta = (req: any, res: Response, next: Function) => {
  const startTime = Date.now()

  // Add request ID if not present
  req.requestId ??= `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Override res.json to add metadata
  const originalJson = res.json
  res.json = function (data: any) {
    if (data && typeof data === 'object' && 'meta' in data) {
      data.meta = {
        ...data.meta,
        requestId: req.requestId,
        path: req.path,
        method: req.method,
        duration: Date.now() - startTime,
      }
    }
    return originalJson.call(this, data)
  }

  next()
}

// Validation error formatter
export const formatValidationErrors = (errors: any[]): ErrorDetail[] => {
  return errors.map(error => ({
    field: error.path?.join('.') ?? 'unknown',
    message: error.message,
    value: error.value,
    code: error.code,
  }))
}
