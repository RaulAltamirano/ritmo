/**
 * 🧪 TEST APP EXPORT - RITMO API 2025
 *
 * Exporta la aplicación Express para tests
 */

import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'

import apiRoutes from './api/routes/index.js'

import { ResponseMiddleware } from './api/responses/api.response.js'

import { ritmoLogger } from './core/utils/logger.js'

import { errorHandler } from './core/middleware/errorHandler.js'

const app: express.Application = express()

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
)

// CORS configuration for tests
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Request-ID',
      'x-timestamp',
      'x-path-info',
      'x-api-version',
      'x-client-version',
      'x-device-id',
      'x-session-id',
      // Device fingerprinting headers
      'X-Device-Id',
      'X-Device-Type',
      'X-Device-Browser',
      'X-Device-OS',
      'Idempotency-Key',
    ],
    exposedHeaders: ['X-Request-ID', 'x-timestamp', 'x-path-info', 'x-api-version'],
  }),
)

// ========================================
// RATE LIMITING CONFIGURATION FOR TESTS
// ========================================

// Configuración más permisiva para tests
const testRateLimits = {
  windowMs: 1 * 60 * 1000, // 1 minuto para tests
  max: 200, // 200 requests por minuto para tests (muy permisivo)
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // No saltar requests exitosos en tests
  skipFailedRequests: false, // No saltar requests fallidos en tests
}

// Configuración específica para endpoints de auth en tests
const authRateLimits = {
  windowMs: 60 * 1000, // 1 minuto para auth (más permisivo)
  max: 50, // 50 intentos por minuto (más permisivo)
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
}

const limiter = rateLimit(testRateLimits)
const authLimiter = rateLimit(authRateLimits)

// Aplicar rate limiting más estricto en tests
app.use('/api/', limiter)
app.use('/api/auth/', authLimiter)

app.use(compression())

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Handle JSON parsing errors
app.use((error: any, req: any, res: any, next: any) => {
  if (
    error instanceof SyntaxError &&
    (error as any).status === 400 &&
    'body' in error
  ) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid JSON format',
        details: [{ field: 'body', message: 'Request body contains invalid JSON' }],
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        requestId: req.requestId,
      },
    })
  }
  return next(error)
})

app.use(cookieParser())

app.use(ResponseMiddleware.addRequestId)
app.use(ResponseMiddleware.addTimestamp)
app.use(ResponseMiddleware.addPathInfo)
app.use(ResponseMiddleware.formatResponse)

app.use('/api', apiRoutes)

app.use(errorHandler)

app.use('*', (req, res) => {
  ritmoLogger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`)

  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
    meta: {
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      requestId: req.requestId,
    },
  })
})

app.use((error: any, req: any, res: any, _next: any) => {
  ritmoLogger.error('Global error handler triggered', error)

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    },
    meta: {
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      requestId: req.requestId,
    },
  })
})

export default app
