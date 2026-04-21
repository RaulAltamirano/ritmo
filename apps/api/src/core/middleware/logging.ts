/**
 * 🚀 RITMO LOGGING MIDDLEWARE - EXPRESS INTEGRATION
 *
 * Express middleware for comprehensive request/response logging
 * Integrates with the RitmoLogger for structured logging
 */

import { NextFunction, Request, Response } from 'express'
import { LogContext, createRequestLogger, ritmoLogger } from '../utils/logger.js'

// =============================================================================
// REQUEST LOGGING MIDDLEWARE
// =============================================================================

export const requestLoggingMiddleware = createRequestLogger(ritmoLogger)

// =============================================================================
// ERROR LOGGING MIDDLEWARE
// =============================================================================

export const errorLoggingMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const context: LogContext = {
    requestId: req.headers['x-request-id'] as string,
    method: req.method,
    path: req.path,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent'],
    userId: (req as any).user?.id,
    sessionId: (req as any).sessionId,
    statusCode: res.statusCode,
    error,
  }

  ritmoLogger.error('Unhandled error in request', error, context)
  next(error)
}

// =============================================================================
// SECURITY LOGGING MIDDLEWARE
// =============================================================================

export const securityLoggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const context: LogContext = {
    requestId: req.headers['x-request-id'] as string,
    method: req.method,
    path: req.path,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent'],
  }

  // Log suspicious activities
  if (req.path.includes('/auth') && req.method === 'POST') {
    ritmoLogger.security('Authentication attempt', 'low', context)
  }

  // Log admin actions
  if (req.path.includes('/admin') || req.path.includes('/system')) {
    ritmoLogger.security('Admin action accessed', 'medium', context)
  }

  next()
}

// =============================================================================
// PERFORMANCE LOGGING MIDDLEWARE
// =============================================================================

export const performanceLoggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const startTime = Date.now()
  const startMemory = process.memoryUsage()

  // Override res.end to capture performance metrics
  const originalEnd = res.end.bind(res)
  const wrappedEnd = function (this: Response, ...args: Parameters<Response['end']>) {
    const duration = Date.now() - startTime
    const endMemory = process.memoryUsage()

    const memoryDiff: NodeJS.MemoryUsage = {
      rss: endMemory.rss - startMemory.rss,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      external: endMemory.external - startMemory.external,
      arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers,
    }

    // Log slow requests
    if (duration > 1000) {
      // More than 1 second
      ritmoLogger.performance({
        operation: `${req.method} ${req.path}`,
        duration,
        memory: memoryDiff,
        metadata: {
          slowRequest: true,
          statusCode: res.statusCode,
        },
      })
    }

    return originalEnd(...args) as Response
  }
  ;(res as unknown as { end: typeof wrappedEnd }).end = wrappedEnd

  next()
}

// =============================================================================
// DATABASE LOGGING MIDDLEWARE
// =============================================================================

export const databaseLoggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const context: LogContext = {
    requestId: req.headers['x-request-id'] as string,
    method: req.method,
    path: req.path,
    userId: (req as any).user?.id,
  }

  // Log database-heavy operations
  if (req.path.includes('/analytics') || req.path.includes('/reports')) {
    ritmoLogger.info('Database-heavy operation requested', context)
  }

  next()
}

// =============================================================================
// COMPOSITE LOGGING MIDDLEWARE
// =============================================================================

export const comprehensiveLoggingMiddleware = [
  requestLoggingMiddleware,
  securityLoggingMiddleware,
  performanceLoggingMiddleware,
  databaseLoggingMiddleware,
]

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const logRequestStart = (req: Request) => {
  const context: LogContext = {
    requestId: req.headers['x-request-id'] as string,
    method: req.method,
    path: req.path,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent'],
  }

  ritmoLogger.info('Request started', context)
}

export const logRequestEnd = (req: Request, res: Response, duration: number) => {
  const context: LogContext = {
    requestId: req.headers['x-request-id'] as string,
    method: req.method,
    path: req.path,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent'],
    statusCode: res.statusCode,
    duration,
  }

  ritmoLogger.info('Request completed', context)
}

export const logError = (error: Error, req: Request, res: Response) => {
  const context: LogContext = {
    requestId: req.headers['x-request-id'] as string,
    method: req.method,
    path: req.path,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent'],
    userId: (req as any).user?.id,
    statusCode: res.statusCode,
    error,
  }

  ritmoLogger.error('Request error', error, context)
}

// =============================================================================
// EXPORTS
// =============================================================================

export default comprehensiveLoggingMiddleware
