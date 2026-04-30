/**
 * 🔐 AUTH ROUTES - RITMO API 2025
 *
 * Rutas del módulo de autenticación core
 * Solo maneja autenticación básica: login, logout, register, refresh
 * Siguiendo Clean Architecture y Domain Driven Design
 */

import { Router } from 'express'
import { asyncHandler } from '../../core/middleware/errorHandler.js'
import { ResponseMiddleware } from '../../api/responses/api.response.js'
import {
  AuthValidator,
  ValidationMiddleware,
} from '../../api/validators/validation.system.js'

// Controllers (solo autenticación core)
import { AuthController } from './controllers/AuthController.js'
import { PasswordController } from './controllers/PasswordController.js'
import { SecurityController } from './controllers/SecurityController.js'

const router = Router()

// Initialize controllers
const authController = new AuthController()
const passwordController = new PasswordController()
const securityController = new SecurityController()

// ========================================
// MIDDLEWARE SETUP
// ========================================

// Add request metadata
router.use(ResponseMiddleware.addRequestId)
router.use(ResponseMiddleware.addTimestamp)
router.use(ResponseMiddleware.addPathInfo)
router.use(ResponseMiddleware.formatResponse)

// ========================================
// CORE AUTHENTICATION ROUTES
// ========================================

/**
 * POST /api/auth/register
 * Registra un nuevo usuario
 */
router.post(
  '/register',
  ValidationMiddleware.validateBody(AuthValidator.registerSchema),
  asyncHandler(authController.register.bind(authController)),
)

/**
 * POST /api/auth/login
 * Inicia sesión de usuario
 */
router.post(
  '/login',
  ValidationMiddleware.validateBody(AuthValidator.loginSchema),
  asyncHandler(authController.login.bind(authController)),
)

/**
 * POST /api/auth/refresh
 * Renueva el token de acceso
 */
router.post(
  '/refresh',
  ValidationMiddleware.validateBody(AuthValidator.refreshSchema),
  asyncHandler(authController.refresh.bind(authController)),
)

/**
 * POST /api/auth/logout
 * Cierra sesión del usuario
 */
router.post(
  '/logout',
  ValidationMiddleware.validateBody(AuthValidator.logoutSchema),
  asyncHandler(authController.logout.bind(authController)),
)

// ========================================
// PASSWORD MANAGEMENT ROUTES
// ========================================

/**
 * POST /api/auth/password/forgot
 * Solicita restablecimiento de contraseña
 */
router.post(
  '/password/forgot',
  ValidationMiddleware.validateBody(AuthValidator.forgotPasswordSchema),
  asyncHandler(passwordController.requestPasswordReset.bind(passwordController)),
)

/**
 * POST /api/auth/password/reset
 * Restablece la contraseña con token
 */
router.post(
  '/password/reset',
  ValidationMiddleware.validateBody(AuthValidator.resetPasswordSchema),
  asyncHandler(passwordController.resetPassword.bind(passwordController)),
)

/**
 * PUT /api/auth/password/change
 * Cambia la contraseña del usuario autenticado
 */
router.put(
  '/password/change',
  ValidationMiddleware.validateBody(AuthValidator.changePasswordSchema),
  asyncHandler(passwordController.changePassword.bind(passwordController)),
)

// ========================================
// SECURITY ROUTES
// ========================================

/**
 * GET /api/auth/security/audit
 * Obtiene el historial de seguridad del usuario
 */
router.get(
  '/security/audit',
  ValidationMiddleware.validateBody(AuthValidator.securityAuditSchema),
  asyncHandler(securityController.getSecurityLogs.bind(securityController)),
)

/**
 * POST /api/auth/security/verify-email
 * Verifica el email del usuario
 */
router.post(
  '/security/verify-email',
  ValidationMiddleware.validateBody(AuthValidator.verifyEmailSchema),
  asyncHandler(securityController.verifyEmail.bind(securityController)),
)

/**
 * POST /api/auth/security/resend-verification
 * Reenvía el email de verificación
 */
router.post(
  '/security/resend-verification',
  ValidationMiddleware.validateBody(AuthValidator.resendVerificationSchema),
  asyncHandler(securityController.resendVerification.bind(securityController)),
)

export default router
