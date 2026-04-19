/**
 * 🚀 RITMO PROFESSIONAL LOGGER - 2025 BEST PRACTICES
 *
 * Modern, production-ready logging system using Winston
 * Features:
 * - Structured logging with JSON format
 * - Daily log rotation
 * - Environment-specific configurations
 * - Request/response logging
 * - Performance monitoring
 * - Security event logging
 * - Error tracking with stack traces
 * - Log levels with custom colors
 * - Request correlation IDs
 * - OpenTelemetry integration ready
 * - Observability standards compliance
 * - GDPR/CCPA compliance
 * - Zero-downtime log rotation
 * - Async logging for performance
 */

// Core imports

// Internal imports
import { LoggerFactory } from './logger/factory.js'
import { RitmoLogger } from './logger/ritmo-logger.js'

// =============================================================================
// LOGGER INSTANCE
// =============================================================================

const environment = process.env.NODE_ENV || 'development'
const logger = LoggerFactory.createLogger(environment)

// =============================================================================
// EXPORTS
// =============================================================================

// Main logger instance
export const ritmoLogger = new RitmoLogger(logger)

// Winston logger for direct access
export { logger as winstonLogger }

// Utility functions
export const logError = (message: string, error?: Error, context?: any) => {
  ritmoLogger.error(message, error, context)
}

export const logInfo = (message: string, context?: any) => {
  ritmoLogger.info(message, context)
}

export const logSecurity = (
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  context?: any,
) => {
  ritmoLogger.security(event, severity, context)
}

export const logPerformance = (metrics: any) => {
  ritmoLogger.performance(metrics)
}

// Re-export types and classes
export { createPerformanceMonitor } from './logger/performance-monitor.js'
export { createRequestLogger } from './logger/request-logger.js'
export { RitmoLogger } from './logger/ritmo-logger.js'
export type { LogContext, PerformanceMetrics } from './logger/types.js'

// Default export
export default ritmoLogger
