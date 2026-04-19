/**
 * 🌐 REQUEST LOGGER - 2025 BEST PRACTICES
 *
 * Express middleware for comprehensive request/response logging
 * Request correlation IDs and performance monitoring
 */

import { LogContext } from './types.js'
import { RitmoLogger } from './ritmo-logger.js'

// =============================================================================
// REQUEST LOGGER MIDDLEWARE
// =============================================================================

export const createRequestLogger = (logger: RitmoLogger) => {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now()
    const requestId =
      req.headers['x-request-id'] ||
      `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Add request ID to response headers
    res.setHeader('X-Request-ID', requestId)

    // Create request context
    const requestContext: LogContext = {
      requestId,
      method: req.method,
      path: req.path,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      userId: req.user?.id,
      sessionId: req.sessionId,
    }

    // Log request start
    logger.setContext(requestContext).info('REQUEST_START', {
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params,
    })

    // Override res.end to log response
    const originalEnd = res.end
    res.end = function (chunk: any, encoding: any) {
      const duration = Date.now() - startTime
      const responseContext: LogContext = {
        ...requestContext,
        statusCode: res.statusCode,
        duration,
      }

      // Log response
      logger.setContext(responseContext).info('REQUEST_END', {
        statusCode: res.statusCode,
        duration,
        responseSize: chunk ? chunk.length : 0,
      })

      originalEnd.call(this, chunk, encoding)
    }

    next()
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default createRequestLogger
