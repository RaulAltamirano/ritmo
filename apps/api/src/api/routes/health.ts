import { config, secretManager } from '@ritmo/config'
import express from 'express'
import { SuccessResponse } from '../responses/api.response.js'

const router: express.Router = express.Router()

router.get('/', async (req, res) => {
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.server.environment,
      version: config.api.version,
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      cors: {
        allowedOrigins: config.server.cors.origins,
        credentials: true,
      },
    }

    const response = new SuccessResponse(healthData, 'Backend is healthy and running')
    response.withMeta({
      path: req.path,
      method: req.method,
      requestId: req.requestId,
    })

    response.send(res, 200)
  } catch (error) {
    console.error('Health check failed:', error)

    const errorResponse = {
      success: false,
      status: 'error',
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: 'Health check failed',
        details: [
          { message: error instanceof Error ? error.message : 'Unknown error' },
        ],
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        requestId: req.requestId,
      },
    }

    res.status(500).json(errorResponse)
  }
})

/**
 * Auth status endpoint - NO requiere autenticación
 *
 * URL completa: /api/health/auth-status
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     hasAccessToken: boolean,
 *     hasRefreshToken: boolean,
 *     cookies: string[],
 *     headers: object
 *   },
 *   message: string,
 *   meta: object
 * }
 */
router.get('/auth-status', async (req, res) => {
  try {
    const authStatus = {
      hasAccessToken: !!req.cookies?.access_token,
      hasRefreshToken: !!req.cookies?.refresh_token,
      cookies: Object.keys(req.cookies || {}),
      headers: {
        origin: req.headers.origin,
        'user-agent': req.headers['user-agent']?.substring(0, 50),
      },
    }

    const response = new SuccessResponse(authStatus, 'Auth status check completed')
    response.withMeta({
      path: req.path,
      method: req.method,
      requestId: req.requestId,
    })

    response.send(res, 200)
  } catch (error) {
    console.error('Auth status check failed:', error)

    const errorResponse = {
      success: false,
      status: 'error',
      error: {
        code: 'AUTH_STATUS_CHECK_FAILED',
        message: 'Auth status check failed',
        details: [
          { message: error instanceof Error ? error.message : 'Unknown error' },
        ],
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        requestId: req.requestId,
      },
    }

    res.status(500).json(errorResponse)
  }
})

/**
 * Configuration health check endpoint - NO requiere autenticación
 *
 * URL completa: /api/health/config-health
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     jwtSecretConfigured: boolean,
 *     jwtRefreshSecretConfigured: boolean,
 *     sessionSecretConfigured: boolean,
 *     jwtSecretLength: number,
 *     jwtRefreshSecretLength: number,
 *     sessionSecretLength: number,
 *     databaseUrlConfigured: boolean,
 *     nodeEnv: string,
 *     serverPort: number,
 *     allowedOrigins: string[],
 *     redisConfigured: boolean,
 *     emailConfigured: boolean
 *   },
 *   message: string,
 *   meta: object
 * }
 */
router.get('/config-health', async (req, res) => {
  try {
    const jwtSecret = secretManager.getJWTSecret()
    const jwtRefreshSecret = secretManager.getJWTRefreshSecret()
    const sessionSecret = secretManager.getSessionSecret()

    const configHealthData = {
      jwtSecretConfigured: !!jwtSecret,
      jwtRefreshSecretConfigured: !!jwtRefreshSecret,
      sessionSecretConfigured: !!sessionSecret,
      jwtSecretLength: jwtSecret.length,
      jwtRefreshSecretLength: jwtRefreshSecret.length,
      sessionSecretLength: sessionSecret.length,
      databaseUrlConfigured: !!config.database.url,
      nodeEnv: config.server.environment,
      serverPort: config.server.port,
      allowedOrigins: config.server.cors.origins,
      redisConfigured: !!config.redis.url,
      emailConfigured: !!config.email.host,
    }

    const response = new SuccessResponse(
      configHealthData,
      'Configuration health check completed',
    )
    response.withMeta({
      path: req.path,
      method: req.method,
      requestId: req.requestId,
    })

    response.send(res, 200)
  } catch (error) {
    console.error('Configuration health check failed:', error)

    const errorResponse = {
      success: false,
      status: 'error',
      error: {
        code: 'CONFIG_HEALTH_CHECK_FAILED',
        message: 'Configuration health check failed',
        details: [
          { message: error instanceof Error ? error.message : 'Unknown error' },
        ],
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        requestId: req.requestId,
      },
    }

    res.status(500).json(errorResponse)
  }
})

export default router
