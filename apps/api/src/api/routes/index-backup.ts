/**
 * 🛣️ MAIN ROUTES - RITMO API 2025
 *
 * Archivo principal de rutas que conecta todos los módulos
 * Siguiendo patrones de Clean Architecture
 */

import { Router } from 'express'
import authRoutes from '../../modules/auth/routes.js'
import circadianRoutes from '../../modules/circadian/routes.js'
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
// API VERSIONING
// ========================================

// API version info
router.get('/version', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      api: 'v1',
      version: '2025.1.0',
      features: [
        'Authentication & Authorization',
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

// Mount auth module routes
router.use('/auth', authRoutes)

// Mount circadian module routes
router.use('/circadian', circadianRoutes)

// TODO: Mount other module routes when implemented
// router.use('/users', userRoutes);
// router.use('/analytics', analyticsRoutes);

// ========================================
// ROOT ENDPOINT
// ========================================

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'RITMO API',
      version: '2025.1.0',
      description: 'Productivity and Circadian Rhythm Management API',
      status: 'running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      modules: [
        {
          name: 'auth',
          status: 'active',
          endpoints: [
            'POST /api/auth/register',
            'POST /api/auth/login',
            'POST /api/auth/refresh',
            'POST /api/auth/logout',
            'GET /api/auth/me',
          ],
        },
        {
          name: 'circadian',
          status: 'active',
          endpoints: [
            'GET /api/circadian/phases',
            'GET /api/circadian/current-phase',
            'GET /api/circadian/preferences',
            'POST /api/circadian/preferences',
            'POST /api/circadian/sessions',
            'GET /api/circadian/sessions',
            'GET /api/circadian/recommendations',
            'GET /api/circadian/analytics',
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
      version: '2025.1.0',
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
              path: '/preferences',
              description: 'Get user preferences',
              requiresAuth: true,
            },
            {
              method: 'POST',
              path: '/preferences',
              description: 'Update user preferences',
              requiresAuth: true,
            },
            {
              method: 'POST',
              path: '/sessions',
              description: 'Record work session',
              requiresAuth: true,
            },
            {
              method: 'GET',
              path: '/sessions',
              description: 'Get session history',
              requiresAuth: true,
            },
            {
              method: 'GET',
              path: '/recommendations',
              description: 'Get productivity recommendations',
              requiresAuth: true,
            },
            {
              method: 'GET',
              path: '/analytics',
              description: 'Get analytics and insights',
              requiresAuth: true,
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
        'GET /api/auth/me',
        'GET /api/circadian/phases',
        'GET /api/circadian/current-phase',
        'GET /api/circadian/preferences',
        'POST /api/circadian/preferences',
        'POST /api/circadian/sessions',
        'GET /api/circadian/sessions',
        'GET /api/circadian/recommendations',
        'GET /api/circadian/analytics',
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

// ========================================
// GLOBAL ERROR HANDLER
// ========================================

router.use((error: any, req: any, res: any, next: any) => {
  console.error('Global error handler:', error)

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

export default router
