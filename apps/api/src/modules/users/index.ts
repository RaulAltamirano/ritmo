/**
 * 👤 USERS MODULE - RITMO API 2025
 *
 * Módulo independiente para gestión de usuarios
 * Siguiendo Clean Architecture y Domain Driven Design
 */

// ========================================
// EXPORTS
// ========================================

// Export all controllers
export { UserController } from './controllers/UserController.js'

// Export all services
export { UserService } from './services/UserService.js'

// Export all DTOs
export * from './dto/UserDTOs.js'

// Export routes
export { default as userRoutes } from './routes.js'
