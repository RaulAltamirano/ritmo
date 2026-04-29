/**
 * 🛣️ MAIN ROUTES - RITMO API 2025
 *
 * Archivo principal de rutas que conecta todos los módulos
 * Siguiendo patrones de Clean Architecture
 */

import { Router } from 'express'
import { authRoutes } from '../../modules/auth/index.js'
import { checkinRoutes } from '../../modules/checkins/index.js'
import { taskRoutes } from '../../modules/tasks/index.js'
import { workSessionRoutes } from '../../modules/work-sessions/index.js'
import circadianRoutes from '../../modules/circadian/routes.js'
import deviceRoutes from '../../modules/devices/routes.js'
import sessionRoutes from '../../modules/sessions/routes.js'
import userRoutes from '../../modules/users/routes.js'
import { ResponseMiddleware } from '../responses/api.response.js'
import healthRoutes from './health.js'

const router: Router = Router()

// ========================================
// GLOBAL MIDDLEWARE
// ========================================

// Add request metadata to all routes
router.use(ResponseMiddleware.addRequestId)
router.use(ResponseMiddleware.addTimestamp)
router.use(ResponseMiddleware.addPathInfo)
router.use(ResponseMiddleware.formatResponse)

// ========================================
// HEALTH CHECK ROUTES
// ========================================

// Mount health routes
router.use('/health', healthRoutes)

// ========================================
// API INFO
// ========================================

// API version info
router.get('/version', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      api: 'v1',
      version: '2025.2.0',
      features: [
        'Authentication & Authorization (Refactored)',
        'Circadian Phases Management',
        'User Preferences & Analytics',
        'Work Session Tracking',
        'Productivity Recommendations',
      ],
      documentation: '/docs',
      timestamp: new Date().toISOString(),
    },
    message: 'RITMO API Version Information',
    meta: {
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      requestId: req.requestId,
    },
  })
})

// ========================================
// MODULE ROUTES
// ========================================

// Mount auth module routes (core authentication only)
router.use('/auth', authRoutes)

// Mount circadian module routes
router.use('/circadian', circadianRoutes)

// Mount independent module routes
router.use('/sessions', sessionRoutes)
router.use('/users', userRoutes)
router.use('/devices', deviceRoutes)
router.use('/tasks', taskRoutes)
router.use('/checkins', checkinRoutes)
router.use('/work-sessions', workSessionRoutes)

// ========================================
// ROOT ENDPOINT
// ========================================

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'RITMO API',
      version: '2025.2.0',
      description: 'Productivity and Circadian Rhythm Management API',
      status: 'running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? 'development',
      modules: [
        {
          name: 'auth',
          status: 'active',
          description: 'Core authentication and authorization',
          endpoints: [
            'POST /api/auth/register',
            'POST /api/auth/login',
            'POST /api/auth/refresh',
            'POST /api/auth/logout',
          ],
        },
        {
          name: 'sessions',
          status: 'active',
          description: 'Session management and analytics',
          endpoints: [
            'GET /api/sessions',
            'GET /api/sessions/stats',
            'DELETE /api/sessions/:sessionId',
            'DELETE /api/sessions/all',
          ],
        },
        {
          name: 'users',
          status: 'active',
          description: 'User profile and preferences management',
          endpoints: [
            'GET /api/users/me',
            'PUT /api/users/profile',
            'GET /api/users/preferences',
            'PUT /api/users/preferences',
          ],
        },
        {
          name: 'devices',
          status: 'active',
          description: 'Device management and trust',
          endpoints: [
            'GET /api/devices',
            'GET /api/devices/stats',
            'DELETE /api/devices/:deviceId',
          ],
        },
        {
          name: 'circadian',
          status: 'active',
          description: 'Circadian rhythm and productivity management',
          endpoints: [
            'GET /api/circadian/phases',
            'GET /api/circadian/current-phase',
            'GET /api/circadian/health',
          ],
        },
      ],
    },
    message: 'RITMO API is running successfully',
    meta: {
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      requestId: req.requestId,
    },
  })
})

// ========================================
// API DOCUMENTATION
// ========================================

router.get('/docs', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      title: 'RITMO API Documentation',
      version: '2025.2.0',
      description: 'Complete API documentation for RITMO',
      sections: [
        {
          title: 'Authentication',
          description: 'User authentication and authorization endpoints',
          basePath: '/api/auth',
          endpoints: [
            {
              method: 'POST',
              path: '/register',
              description: 'Register a new user',
              requiresAuth: false,
            },
            {
              method: 'POST',
              path: '/login',
              description: 'Login user',
              requiresAuth: false,
            },
            {
              method: 'POST',
              path: '/refresh',
              description: 'Refresh access token',
              requiresAuth: false,
            },
            {
              method: 'POST',
              path: '/logout',
              description: 'Logout user',
              requiresAuth: true,
            },
            {
              method: 'GET',
              path: '/me',
              description: 'Get current user info',
              requiresAuth: true,
            },
          ],
        },
        {
          title: 'Circadian Phases',
          description: 'Circadian rhythm and productivity management',
          basePath: '/api/circadian',
          endpoints: [
            {
              method: 'GET',
              path: '/phases',
              description: 'Get all circadian phases',
              requiresAuth: false,
            },
            {
              method: 'GET',
              path: '/current-phase',
              description: 'Get current circadian phase',
              requiresAuth: false,
            },
            {
              method: 'GET',
              path: '/health',
              description: 'Circadian module health check',
              requiresAuth: false,
            },
          ],
        },
      ],
      links: {
        swagger: '/api/docs/swagger',
        postman: '/api/docs/postman',
        github: 'https://github.com/ritmo/api',
      },
    },
    message: 'API Documentation',
    meta: {
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      requestId: req.requestId,
    },
  })
})

// ========================================
// 404 HANDLER FOR UNDEFINED ROUTES
// ========================================

router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
    data: {
      availableRoutes: [
        'GET /api',
        'GET /api/version',
        'GET /api/docs',
        'GET /api/health',
        'POST /api/auth/register',
        'POST /api/auth/login',
        'POST /api/auth/refresh',
        'POST /api/auth/logout',
        'GET /api/sessions',
        'GET /api/sessions/stats',
        'DELETE /api/sessions/:sessionId',
        'DELETE /api/sessions/all',
        'GET /api/users/me',
        'PUT /api/users/profile',
        'GET /api/users/preferences',
        'PUT /api/users/preferences',
        'GET /api/devices',
        'GET /api/devices/stats',
        'DELETE /api/devices/:deviceId',
        'GET /api/circadian/phases',
        'GET /api/circadian/current-phase',
        'GET /api/circadian/health',
      ],
    },
    meta: {
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      requestId: req.requestId,
    },
  })
})

// Errors from /api/* routes bubble to `errorHandler` in `app.ts` (do not force 500 here).

export default router
