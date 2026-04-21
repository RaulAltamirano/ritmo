import { config } from '@ritmo/config'
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

const app = express()

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

// CORS configuration
app.use(
  cors({
    origin: config.server.cors.origins,
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
    ],
    exposedHeaders: ['X-Request-ID', 'x-timestamp', 'x-path-info', 'x-api-version'],
  }),
)

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/', limiter)

app.use(compression())

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

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

app.use((error: any, req: any, res: any, next: any) => {
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

const PORT = config.server.port || 3001
const HOST = config.server.host || '0.0.0.0'

let server: any = null

async function startServer() {
  try {
    ritmoLogger.info('🚀 Starting RITMO API Server')

    server = app.listen(PORT, HOST, () => {
      ritmoLogger.info('🚀 RITMO API Server started successfully!')
      ritmoLogger.info(`📍 Server running on: http://${HOST}:${PORT}`)
      ritmoLogger.info(`🌍 Environment: ${config.server.environment}`)
      ritmoLogger.info(`📅 Started at: ${new Date().toISOString()}`)
      ritmoLogger.info(`🔗 API Documentation: http://${HOST}:${PORT}/api/docs`)
      ritmoLogger.info(`💚 Health Check: http://${HOST}:${PORT}/api/health`)
      ritmoLogger.info(`🔐 Auth Endpoints: http://${HOST}:${PORT}/api/auth/`)

      // Log successful startup
      ritmoLogger.info('✅ RITMO API Server started successfully')
    })
  } catch (error) {
    ritmoLogger.error('❌ Failed to start RITMO API Server', error as Error)
    process.exit(1)
  }
}

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

async function gracefulShutdown(signal: string) {
  ritmoLogger.info(`🛑 Received ${signal}, starting graceful shutdown`)

  if (server) {
    server.close(() => {
      ritmoLogger.info('✅ Server closed successfully')
      process.exit(0)
    })

    // Force close after 10 seconds
    setTimeout(() => {
      ritmoLogger.error(
        '❌ Could not close connections in time, forcefully shutting down',
      )
      process.exit(1)
    }, 10000)
  } else {
    ritmoLogger.info('✅ No server to close, exiting')
    process.exit(0)
  }
}

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  ritmoLogger.error('❌ Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// ========================================
// START SERVER
// ========================================

startServer().catch(error => {
  console.error('❌ Unhandled error during server startup:', error)
  process.exit(1)
})
