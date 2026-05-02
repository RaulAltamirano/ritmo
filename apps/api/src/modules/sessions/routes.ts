/**
 * 🎫 SESSION ROUTES - RITMO API 2025
 *
 * Rutas del módulo de sesiones siguiendo patrones REST
 * Endpoints independientes para gestión de sesiones
 */

import { Router } from 'express'
import { asyncHandler } from '../../core/middleware/errorHandler.js'
import { ResponseMiddleware } from '../../api/responses/api.response.js'
import { authenticateToken } from '../../core/middleware/auth.js'
import { SessionController } from './controllers/SessionController.js'

const router = Router()
const sessionController = new SessionController()

// ========================================
// MIDDLEWARE SETUP
// ========================================

// Add request metadata
router.use(ResponseMiddleware.addRequestId)
router.use(ResponseMiddleware.addTimestamp)

// ========================================
// SESSION ROUTES
// ========================================

/**
 * GET /api/sessions
 * Obtiene todas las sesiones activas del usuario
 */
router.get(
  '/',
  asyncHandler(authenticateToken),
  asyncHandler(sessionController.getSessions.bind(sessionController)),
)

/**
 * GET /api/sessions/stats
 * Obtiene estadísticas de sesiones del usuario
 */
router.get(
  '/stats',
  asyncHandler(authenticateToken),
  asyncHandler(sessionController.getSessionStats.bind(sessionController)),
)

/**
 * DELETE /api/sessions/:sessionId
 * Desactiva una sesión específica
 */
router.delete(
  '/:sessionId',
  asyncHandler(authenticateToken),
  asyncHandler(sessionController.deactivateSession.bind(sessionController)),
)

/**
 * DELETE /api/sessions/all
 * Desactiva todas las sesiones del usuario
 */
router.delete(
  '/all',
  asyncHandler(authenticateToken),
  asyncHandler(sessionController.deactivateAllSessions.bind(sessionController)),
)

export default router
