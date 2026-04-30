/**
 * 📱 DEVICE ROUTES - RITMO API 2025
 *
 * Rutas del módulo de dispositivos siguiendo patrones REST
 * Endpoints independientes para gestión de dispositivos
 */

import { Router } from 'express'
import { asyncHandler } from '../../core/middleware/errorHandler.js'
import { ResponseMiddleware } from '../../api/responses/api.response.js'
import { authenticateToken } from '../../core/middleware/auth.js'
import { DeviceController } from './controllers/DeviceController.js'

const router = Router()
const deviceController = new DeviceController()

// ========================================
// MIDDLEWARE SETUP
// ========================================

// Add request metadata
router.use(ResponseMiddleware.addRequestId)
router.use(ResponseMiddleware.addTimestamp)

// ========================================
// DEVICE ROUTES
// ========================================

/**
 * GET /api/devices
 * Obtiene todos los dispositivos del usuario
 */
router.get(
  '/',
  asyncHandler(authenticateToken),
  asyncHandler(deviceController.getDevices.bind(deviceController)),
)

/**
 * GET /api/devices/stats
 * Obtiene estadísticas de dispositivos
 */
router.get(
  '/stats',
  asyncHandler(authenticateToken),
  asyncHandler(deviceController.getDeviceStats.bind(deviceController)),
)

/**
 * DELETE /api/devices/:deviceId
 * Desautoriza un dispositivo específico
 */
router.delete(
  '/:deviceId',
  asyncHandler(authenticateToken),
  asyncHandler(deviceController.deauthorizeDevice.bind(deviceController)),
)

export default router
