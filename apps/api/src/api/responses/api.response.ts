/**
 * 📡 API RESPONSE SYSTEM - RITMO API 2025
 *
 * Sistema moderno de respuestas API con tipado fuerte
 * Siguiendo estándares REST y OpenAPI
 */

import * as crypto from 'crypto'
import { AppException } from '../../shared/exceptions/app.exceptions.js'
import { IApiResponse } from '../../shared/interfaces/base.interface.js'

// ========================================
// BASE API RESPONSE CLASS
// ========================================

export class ApiResponse<T = any> implements IApiResponse<T> {
  public success: boolean
  public data?: T
  public message?: string
  public error?: {
    code: string
    message: string
    details?: any[]
  }
  public meta?: {
    timestamp: string
    path: string
    method: string
    requestId?: string
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }

  constructor(success: boolean, data?: T, message?: string, error?: any, meta?: any) {
    this.success = success
    this.data = data
    this.message = message
    this.error = error
    this.meta = meta
  }

  public withMeta(meta: any): this {
    this.meta = { ...this.meta, ...meta }
    return this
  }

  public withPagination(pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }): this {
    this.meta ??= {
      timestamp: new Date().toISOString(),
      path: '',
      method: '',
    }

    this.meta.pagination = pagination
    return this
  }

  public withRequestId(requestId: string): this {
    this.meta ??= {
      timestamp: new Date().toISOString(),
      path: '',
      method: '',
    }
    this.meta.requestId = requestId
    return this
  }

  public send(res: any, statusCode = 200): void {
    res.status(statusCode).json(this)
  }
}

// ========================================
// SUCCESS RESPONSE CLASS
// ========================================

export class SuccessResponse<T = any> extends ApiResponse<T> {
  constructor(data?: T, message?: string) {
    super(true, data, message)
  }

  static create<T>(data: T, message?: string): SuccessResponse<T> {
    return new SuccessResponse(data, message)
  }

  static ok<T>(
    data: T,
    message = 'Operation completed successfully',
  ): SuccessResponse<T> {
    return new SuccessResponse(data, message)
  }

  static created<T>(
    data: T,
    message = 'Resource created successfully',
  ): SuccessResponse<T> {
    return new SuccessResponse(data, message)
  }

  static noContent(
    message = 'Operation completed successfully',
  ): SuccessResponse<null> {
    return new SuccessResponse(null, message)
  }
}

// ========================================
// ERROR RESPONSE CLASS
// ========================================

export class ErrorResponse extends ApiResponse<null> {
  constructor(message = 'An error occurred', code = 'INTERNAL_ERROR', details?: any[]) {
    super(false, null, message, { code, message, details })
  }

  static badRequest(message = 'Bad request', details?: any[]): ErrorResponse {
    return new ErrorResponse(message, 'BAD_REQUEST', details)
  }

  static unauthorized(message = 'Unauthorized access'): ErrorResponse {
    return new ErrorResponse(message, 'UNAUTHORIZED')
  }

  static forbidden(message = 'Access forbidden'): ErrorResponse {
    return new ErrorResponse(message, 'FORBIDDEN')
  }

  static notFound(message = 'Resource not found'): ErrorResponse {
    return new ErrorResponse(message, 'NOT_FOUND')
  }

  static conflict(message = 'Resource conflict'): ErrorResponse {
    return new ErrorResponse(message, 'CONFLICT')
  }

  static unprocessableEntity(
    message = 'Validation failed',
    details?: any[],
  ): ErrorResponse {
    return new ErrorResponse(message, 'VALIDATION_ERROR', details)
  }

  static tooManyRequests(message = 'Rate limit exceeded'): ErrorResponse {
    return new ErrorResponse(message, 'RATE_LIMIT_EXCEEDED')
  }

  static internalServerError(message = 'Internal server error'): ErrorResponse {
    return new ErrorResponse(message, 'INTERNAL_ERROR')
  }

  static serviceUnavailable(
    message = 'Service temporarily unavailable',
  ): ErrorResponse {
    return new ErrorResponse(message, 'SERVICE_UNAVAILABLE')
  }

  static fromException(exception: AppException): ErrorResponse {
    return new ErrorResponse(exception.message, exception.code, exception.details)
  }

  withPath(path: string): this {
    this.meta ??= {
      timestamp: new Date().toISOString(),
      path: '',
      method: '',
    }
    this.meta.path = path
    return this
  }

  withMethod(method: string): this {
    this.meta ??= {
      timestamp: new Date().toISOString(),
      path: '',
      method: '',
    }
    this.meta.method = method
    return this
  }

  withRequestId(requestId: string): this {
    this.meta ??= {
      timestamp: new Date().toISOString(),
      path: '',
      method: '',
    }
    this.meta.requestId = requestId
    return this
  }
}

// ========================================
// PAGINATED RESPONSE CLASS
// ========================================

export class PaginatedResponse<T = any> extends SuccessResponse<T[]> {
  constructor(data: T[], page: number, limit: number, total: number, message?: string) {
    const totalPages = Math.ceil(total / limit)
    super(data, message)
    this.withPagination({ page, limit, total, totalPages })
  }

  static createPaginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string,
  ): PaginatedResponse<T> {
    return new PaginatedResponse(data, page, limit, total, message)
  }
}

// ========================================
// API RESPONSE FACTORY
// ========================================

export class ApiResponseFactory {
  static success<T>(data: T, message?: string): SuccessResponse<T> {
    return SuccessResponse.create(data, message)
  }

  static error(message: string, code?: string, details?: any[]): ErrorResponse {
    return new ErrorResponse(message, code, details)
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string,
  ): PaginatedResponse<T> {
    return PaginatedResponse.createPaginated(data, page, limit, total, message)
  }

  static validationError(details: any[]): ErrorResponse {
    return ErrorResponse.unprocessableEntity('Validation failed', details)
  }

  static unauthorizedError(message?: string): ErrorResponse {
    return ErrorResponse.unauthorized(message)
  }

  static notFoundError(resource?: string): ErrorResponse {
    const message = resource ? `${resource} not found` : 'Resource not found'
    return ErrorResponse.notFound(message)
  }

  static internalError(message?: string): ErrorResponse {
    return ErrorResponse.internalServerError(message)
  }
}

// ========================================
// RESPONSE MIDDLEWARE
// ========================================

export class ResponseMiddleware {
  static addRequestId(req: any, res: any, next: any): void {
    req.requestId =
      crypto.randomUUID?.() ||
      `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    next()
  }

  static addTimestamp(req: any, res: any, next: any): void {
    req.requestTimestamp = new Date().toISOString()
    next()
  }

  static addPathInfo(req: any, res: any, next: any): void {
    req.pathInfo = {
      path: req.path,
      method: req.method,
      originalUrl: req.originalUrl,
    }
    next()
  }

  static formatResponse(req: any, res: any, next: any): void {
    const originalSend = res.send

    res.send = function (data: any): any {
      if (typeof data === 'object' && data !== null) {
        data.meta ??= {}

        data.meta.timestamp = req.requestTimestamp ?? new Date().toISOString()
        data.meta.path = req.pathInfo?.path ?? req.path
        data.meta.method = req.pathInfo?.method ?? req.method
        data.meta.requestId = req.requestId
      }

      return originalSend.call(this, data)
    }

    next()
  }
}

// ========================================
// RESPONSE UTILITIES
// ========================================

export class ResponseUtils {
  static formatValidationErrors(errors: any[]): any[] {
    return errors.map(error => ({
      field: error.path?.join('.') ?? 'unknown',
      message: error.message,
      value: error.value,
    }))
  }

  static sanitizeData(data: any): any {
    if (typeof data !== 'object' || data === null) return data

    const sanitized: any = {}
    const sensitiveFields = ['password', 'passwordHash', 'token', 'secret']

    for (const [key, value] of Object.entries(data)) {
      if (sensitiveFields.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]'
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeData(value)
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }

  static addSecurityHeaders(res: any): void {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    res.setHeader('Content-Security-Policy', "default-src 'self'")
  }

  static addCachingHeaders(res: any, maxAge = 300): void {
    res.setHeader('Cache-Control', `public, max-age=${maxAge}`)
    res.setHeader('ETag', `"${Date.now()}"`)
  }

  static addNoCacheHeaders(res: any): void {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
  }
}
