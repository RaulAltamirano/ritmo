/**
 * RITMO SERVER CONFIGURATION SERVICE
 *
 * Handles server setup, middleware configuration, and route registration
 * Updated with modern 2025 routing patterns
 */

import { config } from '@ritmo/config'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Application } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { errorHandler, notFoundHandler } from '../../core/middleware/errorHandler.js'
import { comprehensiveLoggingMiddleware } from '../../core/middleware/logging.js'
import { ritmoLogger } from '../../core/utils/logger.js'
import { MESSAGES, SERVER_CONSTANTS } from '../../shared/constants/serverConstants.js'
// ✅ NUEVO: Importar el router centralizado
import apiRouter from '../../api/routes/index.js'
import { addRequestMeta } from '../../core/utils/apiResponse.js'

export class ServerConfigurationService {
  private readonly app: Application
  private readonly logger = ritmoLogger

  constructor() {
    this.app = express()
  }

  // ===========================================================================
  // MAIN CONFIGURATION METHOD
  // ===========================================================================

  configureServer(): Application {
    this.logger.info(MESSAGES.SERVER.INIT)

    // Configure logging middleware first
    this.configureLogging()

    // Configure security middleware
    this.configureSecurity()

    // Configure CORS
    this.configureCORS()

    // Configure rate limiting
    this.configureRateLimiting()

    // Configure request logging
    this.configureRequestLogging()

    // Configure body parsing
    this.configureBodyParsing()

    // ✅ NUEVO: Configure routes usando el sistema centralizado
    this.configureRoutes()

    // Configure error handling
    this.configureErrorHandling()

    this.logger.info('Server configured successfully')

    return this.app
  }

  // ===========================================================================
  // LOGGING CONFIGURATION
  // ===========================================================================

  private configureLogging(): void {
    // Apply comprehensive logging middleware
    this.app.use(comprehensiveLoggingMiddleware)

    this.logger.info('Logging middleware configured successfully')
  }

  // ===========================================================================
  // SECURITY CONFIGURATION
  // ===========================================================================

  private configureSecurity(): void {
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: SERVER_CONSTANTS.SECURITY.CSP_DIRECTIVES,
        },
        crossOriginEmbedderPolicy: SERVER_CONSTANTS.SECURITY.CROSS_ORIGIN_EMBEDDER,
      }),
    )
  }

  // ===========================================================================
  // CORS CONFIGURATION
  // ===========================================================================

  private configureCORS(): void {
    const allowedOrigins = config.server.cors.origins

    // Handle CORS preflight requests
    this.app.options(
      '*',
      cors({
        origin: allowedOrigins,
        credentials: true,
        methods: [...SERVER_CONSTANTS.CORS_METHODS],
        allowedHeaders: [...SERVER_CONSTANTS.CORS_HEADERS.ALLOWED],
        exposedHeaders: [...SERVER_CONSTANTS.CORS_HEADERS.EXPOSED],
      }),
    )

    // Configure CORS middleware
    this.app.use(
      cors({
        origin: this.createCORSOriginHandler(allowedOrigins),
        credentials: true,
        methods: [...SERVER_CONSTANTS.CORS_METHODS],
        allowedHeaders: [...SERVER_CONSTANTS.CORS_HEADERS.ALLOWED],
        exposedHeaders: [...SERVER_CONSTANTS.CORS_HEADERS.EXPOSED],
      }),
    )
  }

  private createCORSOriginHandler(allowedOrigins: string[]) {
    return (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        // CORS: Request with no origin allowed
        callback(null, true)
        return
      }

      // In development, allow all localhost origins
      if (config.server.environment === 'development' && origin.includes('localhost')) {
        // CORS: Development origin allowed
        callback(null, true)
        return
      }

      if (allowedOrigins.includes(origin)) {
        // CORS: Origin allowed
        callback(null, true)
      } else {
        // CORS: Origin blocked
        // Allowed origins listed
        callback(new Error('Not allowed by CORS'))
      }
    }
  }

  // ===========================================================================
  // RATE LIMITING CONFIGURATION
  // ===========================================================================

  private configureRateLimiting(): void {
    const limiter = rateLimit({
      windowMs: SERVER_CONSTANTS.LIMITS.RATE_LIMIT_WINDOW_MS,
      max: SERVER_CONSTANTS.LIMITS.RATE_LIMIT_MAX_REQUESTS,
      message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
        status: 'error',
      },
      standardHeaders: true,
      legacyHeaders: false,
    })

    // ✅ CORRECTO: Rate limiting en toda la API
    this.app.use('/api', limiter)
  }

  // ===========================================================================
  // REQUEST LOGGING CONFIGURATION
  // ===========================================================================

  private configureRequestLogging(): void {
    this.app.use((_req, _res, next) => {
      // Request logged via comprehensive logging middleware
      next()
    })
  }

  // ===========================================================================
  // BODY PARSING CONFIGURATION
  // ===========================================================================

  private configureBodyParsing(): void {
    this.app.use(cookieParser())
    this.app.use(express.json({ limit: SERVER_CONSTANTS.LIMITS.JSON_SIZE }))
    this.app.use(
      express.urlencoded({
        extended: SERVER_CONSTANTS.LIMITS.URL_ENCODED,
        limit: SERVER_CONSTANTS.LIMITS.JSON_SIZE,
      }),
    )
    this.app.use(addRequestMeta)
  }

  // ===========================================================================
  // ROUTES CONFIGURATION - MODERNIZADO 2025
  // ===========================================================================

  private configureRoutes(): void {
    // ✅ CORRECTO: Single mount point para toda la API
    // Esto elimina el problema del doble slash
    this.app.use('/api', apiRouter)

    // ✅ CORRECTO: Health check en root para load balancers
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'RITMO API Server',
        version: '2025.1.0',
      })
    })

    // ✅ CORRECTO: Root endpoint con información de la API
    this.app.get('/', (req, res) => {
      res.json({
        name: 'RITMO API Server',
        version: '2025.1.0',
        description: 'Modern productivity API with circadian rhythm optimization',
        status: 'running',
        documentation: '/api/docs',
        health: '/health',
        api: '/api',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV ?? 'development',
      })
    })
  }

  // ===========================================================================
  // ERROR HANDLING CONFIGURATION
  // ===========================================================================

  private configureErrorHandling(): void {
    this.app.use(errorHandler)
    this.app.use('*', notFoundHandler)
  }

  // ===========================================================================
  // GETTERS
  // ===========================================================================

  getApp(): Application {
    return this.app
  }
}

// Export singleton instance
export const serverConfigurationService = new ServerConfigurationService()
