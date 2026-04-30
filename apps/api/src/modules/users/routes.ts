/**
 * 👤 USER ROUTES - RITMO API 2025
 *
 * Rutas del módulo de usuarios siguiendo patrones REST
 * Endpoints independientes para gestión de usuarios
 */

import { Router } from 'express'
import { asyncHandler } from '../../core/middleware/errorHandler.js'
import { ResponseMiddleware } from '../../api/responses/api.response.js'
import {
  UserValidator,
  ValidationMiddleware,
} from '../../api/validators/validation.system.js'
import { authenticateToken } from '../../core/middleware/auth.js'
import { UserController } from './controllers/UserController.js'

const router = Router()
const userController = new UserController()

// ========================================
// MIDDLEWARE SETUP
// ========================================

// Add request metadata
router.use(ResponseMiddleware.addRequestId)
router.use(ResponseMiddleware.addTimestamp)

// ========================================
// USER ROUTES
// ========================================

/**
 * GET /api/users/me
 * Obtiene información del usuario actual
 */
router.get(
  '/me',
  asyncHandler(authenticateToken),
  asyncHandler(userController.getMe.bind(userController)),
)

/**
 * PUT /api/users/profile
 * Actualiza el perfil del usuario
 */
router.put(
  '/profile',
  asyncHandler(authenticateToken),
  ValidationMiddleware.validateBody(UserValidator.profileUpdateSchema),
  asyncHandler(userController.updateProfile.bind(userController)),
)

/**
 * GET /api/users/preferences
 * Obtiene las preferencias del usuario
 */
router.get(
  '/preferences',
  asyncHandler(authenticateToken),
  asyncHandler(userController.getPreferences.bind(userController)),
)

/**
 * PUT /api/users/preferences
 * Actualiza las preferencias del usuario
 */
router.put(
  '/preferences',
  asyncHandler(authenticateToken),
  ValidationMiddleware.validateBody(UserValidator.preferencesSchema),
  asyncHandler(userController.updatePreferences.bind(userController)),
)

/**
 * PUT /api/users/preferences/theme
 * Actualiza específicamente el tema del usuario
 */
router.put(
  '/preferences/theme',
  asyncHandler(authenticateToken),
  ValidationMiddleware.validateBody(UserValidator.themeUpdateSchema),
  asyncHandler(userController.updateTheme.bind(userController)),
)

export default router
