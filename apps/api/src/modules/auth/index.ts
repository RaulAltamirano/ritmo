/**
 * 🔐 AUTH MODULE - RITMO API 2025
 *
 * Módulo de autenticación core refactorizado
 * Solo maneja autenticación básica: login, logout, register, refresh
 * Siguiendo Clean Architecture y Domain Driven Design
 */

// Export all controllers (core authentication only)
export { AuthController } from './controllers/AuthController.js'
export { PasswordController } from './controllers/PasswordController.js'
export { SecurityController } from './controllers/SecurityController.js'

// Export all services (core authentication only)
export { AuthService } from './services/AuthService.js'
export { PasswordService } from './services/PasswordService.js'
export { SecurityService } from './services/SecurityService.js'

// Export all DTOs
export * from './dto/AuthDTOs.js'

// Export routes
export { default as authRoutes } from './routes.js'
