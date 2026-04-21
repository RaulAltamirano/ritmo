/**
 * 📱 DEVICES MODULE - RITMO API 2025
 *
 * Módulo independiente para gestión de dispositivos
 * Siguiendo Clean Architecture y Domain Driven Design
 */

// ========================================
// EXPORTS
// ========================================

// Export all controllers
export { DeviceController } from './controllers/DeviceController.js'

// Export all services
export { DeviceService } from './services/DeviceService.js'

// Export all DTOs
export * from './dto/DeviceDTOs.js'

// Export routes
export { default as deviceRoutes } from './routes.js'
