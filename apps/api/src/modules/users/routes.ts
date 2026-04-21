/**
 * 👤 USER ROUTES - RITMO API 2025
 *
 * Rutas del módulo de usuarios siguiendo patrones REST
 * Endpoints independientes para gestión de usuarios
 */

import { Router } from 'express'
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
router.get('/me', authenticateToken, userController.getMe.bind(userController))

/**
 * PUT /api/users/profile
 * Actualiza el perfil del usuario
 */
router.put(
  '/profile',
  authenticateToken,
  ValidationMiddleware.validateBody(UserValidator.profileUpdateSchema),
  userController.updateProfile.bind(userController),
)

/**
 * GET /api/users/preferences
 * Obtiene las preferencias del usuario
 */
router.get(
  '/preferences',
  authenticateToken,
  userController.getPreferences.bind(userController),
)

/**
 * PUT /api/users/preferences
 * Actualiza las preferencias del usuario
 */
router.put(
  '/preferences',
  authenticateToken,
  ValidationMiddleware.validateBody(UserValidator.preferencesSchema),
  userController.updatePreferences.bind(userController),
)

/**
 * PUT /api/users/preferences/theme
 * Actualiza específicamente el tema del usuario
 */
router.put(
  '/preferences/theme',
  authenticateToken,
  ValidationMiddleware.validateBody(UserValidator.themeUpdateSchema),
  userController.updateTheme.bind(userController),
)

export default router
