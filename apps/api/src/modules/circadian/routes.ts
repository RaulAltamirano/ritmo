/**
 * 🌅 CIRCADIAN ROUTES - RITMO API 2025
 *
 * Rutas del módulo de fases circadianas siguiendo patrones REST
 * Solo 2 endpoints principales: current-phase y phases
 */

import { Router } from 'express'
import { ResponseMiddleware } from '../../api/responses/api.response.js'
import { CircadianController } from './controllers/CircadianController.js'

const router = Router()
const circadianController = new CircadianController()

// ========================================
// MIDDLEWARE SETUP
// ========================================

// Add request metadata
router.use(ResponseMiddleware.addRequestId)
router.use(ResponseMiddleware.addTimestamp)
router.use(ResponseMiddleware.addPathInfo)
router.use(ResponseMiddleware.formatResponse)

// ========================================
// CIRCADIAN PHASES ROUTES
// ========================================

// GET /api/circadian/phases
// Obtiene todas las fases circadianas disponibles
router.get('/phases', circadianController.getPhases.bind(circadianController))

// GET /api/circadian/current-phase
// Fase actual según hora local en `timezone` (IANA, default UTC)
// Query: timezone, customTime (ISO opcional)
router.get(
  '/current-phase',
  circadianController.getCurrentPhase.bind(circadianController),
)

// ========================================
// HEALTH CHECK ROUTES
// ========================================

// GET /api/circadian/health
router.get('/health', circadianController.getHealth.bind(circadianController))

// ========================================
// ERROR HANDLING MIDDLEWARE
// ========================================

// Handle validation errors
router.use((error: any, req: any, res: any, next: any) => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.details || [],
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        requestId: (req as any).requestId,
      },
    })
  }

  // Handle other errors
  console.error('Circadian route error:', error)
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
    meta: {
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      requestId: (req as any).requestId,
    },
  })
})

// ========================================
// 404 HANDLER
// ========================================

router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Circadian route ${req.method} ${req.originalUrl} not found`,
    },
    data: {
      availableRoutes: [
        'GET /api/circadian/phases',
        'GET /api/circadian/current-phase',
        'GET /api/circadian/health',
      ],
    },
    meta: {
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      requestId: (req as any).requestId,
    },
  })
})

export default router
