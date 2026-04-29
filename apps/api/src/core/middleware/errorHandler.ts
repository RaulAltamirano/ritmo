/**
 * 🚀 RITMO ERROR HANDLING MIDDLEWARE - 2025 BEST PRACTICES
 *
 * Comprehensive error handling with proper logging and response formatting
 * Follows industry standards for error management
 */

import { config } from '@ritmo/config'
import { NextFunction, Request, Response } from 'express'
import { WorkSessionHttpError } from '../../modules/work-sessions/errors.js'
import { ApiResponses, ErrorCode } from '../utils/apiResponse.js'

// Extend Express Request interface to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string
    }
  }
}

// Custom error class for API errors
export class ApiError extends Error {
  public statusCode: number
  public code: ErrorCode | string
  public isOperational: boolean
  public details?: any[]

  constructor(
    statusCode: number,
    code: ErrorCode | string,
    message: string,
    details?: any[],
    isOperational = true,
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational
    this.details = details

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor)
  }
}

// Error logger with structured logging
const logError = (error: any, req: Request) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    requestId: req.requestId ?? 'unknown',
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent'),
    ip: req.ip ?? req.connection.remoteAddress,
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: config.server.environment === 'development' ? error.stack : undefined,
      details: error.details,
    },
    request: {
      body: req.body,
      query: req.query,
      params: req.params,
      headers: {
        'content-type': req.get('Content-Type'),
        // authorization removed - using cookies only
      },
    },
  }

  // Log based on error severity
  if (error.statusCode >= 500) {
    console.error('🚨 CRITICAL ERROR:', JSON.stringify(errorLog, null, 2))
  } else if (error.statusCode >= 400) {
    // Client error logged
  } else {
    // Info logged
  }
}

// Main error handling middleware
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Log the error
  logError(error, req)

  // Handle known API errors
  if (error instanceof ApiError) {
    return ApiResponses.internalError(error.message)
      .withRequestId(req.requestId ?? 'unknown')
      .withPath(req.path)
      .withMethod(req.method)
      .send(res, error.statusCode)
  }

  const isWorkSessionHttp =
    error instanceof WorkSessionHttpError ||
    (error?.name === 'WorkSessionHttpError' &&
      typeof (error as WorkSessionHttpError).statusCode === 'number' &&
      typeof (error as WorkSessionHttpError).code === 'string')
  if (isWorkSessionHttp) {
    const w = error as WorkSessionHttpError
    return res.status(w.statusCode).json({
      success: false,
      status: 'error',
      error: {
        code: w.code,
        message: w.message,
        ...(w.payload ?? {}),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
      },
    })
  }

  // Handle custom app exceptions
  if (
    error.code &&
    error.statusCode &&
    error.timestamp &&
    error.name?.endsWith('Exception')
  ) {
    return ApiResponses.error(error.message, error.code)
      .withRequestId(req.requestId ?? 'unknown')
      .withPath(req.path)
      .withMethod(req.method)
      .send(res, error.statusCode)
  }

  // Handle Prisma errors
  if (error.code?.startsWith('P')) {
    return ApiResponses.prismaError(error)
      .withRequestId(req.requestId ?? 'unknown')
      .withPath(req.path)
      .withMethod(req.method)
      .send(res)
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return ApiResponses.jwtError(error)
      .withRequestId(req.requestId ?? 'unknown')
      .withPath(req.path)
      .withMethod(req.method)
      .send(res)
  }

  // Handle validation errors (Zod, Joi, etc.)
  if (error.name === 'ZodError' || error.name === 'ValidationError') {
    const details =
      error.errors?.map((err: any) => ({
        field: err.path?.join('.') ?? 'unknown',
        message: err.message,
        value: err.value,
        code: err.code,
      })) ?? []

    return ApiResponses.badRequest('Validation failed', details)
      .withRequestId(req.requestId ?? 'unknown')
      .withPath(req.path)
      .withMethod(req.method)
      .send(res)
  }

  // Handle rate limiting errors
  if (error.status === 429 || error.message?.includes('rate limit')) {
    return ApiResponses.rateLimitExceeded('Too many requests, please try again later')
      .withRequestId(req.requestId ?? 'unknown')
      .withPath(req.path)
      .withMethod(req.method)
      .send(res, 429)
  }

  // Handle database connection errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return ApiResponses.internalError('Database connection failed')
      .withRequestId(req.requestId ?? 'unknown')
      .withPath(req.path)
      .withMethod(req.method)
      .send(res, 503)
  }

  // Handle file system errors
  if (error.code === 'ENOENT' || error.code === 'EACCES') {
    return ApiResponses.internalError('File system operation failed')
      .withRequestId(req.requestId ?? 'unknown')
      .withPath(req.path)
      .withMethod(req.method)
      .send(res, 500)
  }

  // Handle network errors
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    return ApiResponses.internalError('Network operation failed')
      .withRequestId(req.requestId ?? 'unknown')
      .withPath(req.path)
      .withMethod(req.method)
      .send(res, 503)
  }

  // Default error handler
  const statusCode = error.statusCode ?? error.status ?? 500
  const message = error.message ?? 'An unexpected error occurred'

  return ApiResponses.internalError(message)
    .withRequestId(req.requestId ?? 'unknown')
    .withPath(req.path)
    .withMethod(req.method)
    .send(res, statusCode)
}

// Async error wrapper for route handlers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// 404 handler for unmatched routes
export const notFoundHandler = (req: Request, res: Response) => {
  return ApiResponses.notFound(`Cannot ${req.method} ${req.path}`)
    .withRequestId(req.requestId ?? 'unknown')
    .withPath(req.path)
    .withMethod(req.method)
    .send(res, 404)
}

// Export utility functions
export const createApiError = (
  statusCode: number,
  code: ErrorCode | string,
  message: string,
  details?: any[],
) => new ApiError(statusCode, code, message, details)

export const isOperationalError = (error: any) => {
  if (error instanceof ApiError) {
    return error.isOperational
  }
  return false
}
