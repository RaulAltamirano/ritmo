/**
 * 🚀 RITMO LOGGER CLASS - 2025 BEST PRACTICES
 *
 * Enhanced logger class with specialized methods for different log types
 * RFC 5424 compliant with chaining support and context management
 */

import winston from 'winston'
import { LogContext, PerformanceMetrics } from './types.js'

// =============================================================================
// ENHANCED LOGGER CLASS
// =============================================================================

export class RitmoLogger {
  private readonly logger: winston.Logger
  private context: LogContext = {}

  constructor(loggerInstance: winston.Logger) {
    this.logger = loggerInstance
  }

  /**
   * Set context for all subsequent log calls
   */
  setContext(context: LogContext): this {
    this.context = { ...this.context, ...context }
    return this
  }

  /**
   * Clear context
   */
  clearContext(): this {
    this.context = {}
    return this
  }

  /**
   * Log emergency events (system unusable)
   */
  emergency(message: string, context?: LogContext): this {
    this.logger.error(message, { ...this.context, ...context, level: 'emergency' })
    return this
  }

  /**
   * Log alert events (immediate action required)
   */
  alert(message: string, context?: LogContext): this {
    this.logger.warn(message, { ...this.context, ...context, level: 'alert' })
    return this
  }

  /**
   * Log critical events
   */
  critical(message: string, context?: LogContext): this {
    this.logger.error(message, { ...this.context, ...context, level: 'critical' })
    return this
  }

  /**
   * Log error with full context
   */
  error(message: string, error?: Error, context?: LogContext): this {
    const logData = {
      ...this.context,
      ...context,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: (error as any).code,
          }
        : undefined,
    }

    this.logger.error(message, logData)
    return this
  }

  /**
   * Log warning
   */
  warn(message: string, context?: LogContext): this {
    this.logger.warn(message, { ...this.context, ...context })
    return this
  }

  /**
   * Log info
   */
  info(message: string, context?: LogContext): this {
    this.logger.info(message, { ...this.context, ...context })
    return this
  }

  /**
   * Log HTTP requests
   */
  http(message: string, context?: LogContext): this {
    this.logger.info(`HTTP: ${message}`, { ...this.context, ...context })
    return this
  }

  /**
   * Log debug information
   */
  debug(message: string, context?: LogContext): this {
    this.logger.debug(message, { ...this.context, ...context })
    return this
  }

  /**
   * Log verbose information
   */
  verbose(message: string, context?: LogContext): this {
    this.logger.debug(`VERBOSE: ${message}`, { ...this.context, ...context })
    return this
  }

  /**
   * Log security events
   */
  security(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    context?: LogContext,
  ): this {
    this.logger.warn(`SECURITY: ${event}`, {
      ...this.context,
      ...context,
      securityEvent: true,
      severity,
      timestamp: new Date().toISOString(),
    })
    return this
  }

  /**
   * Log performance metrics
   */
  performance(metrics: PerformanceMetrics): this {
    this.logger.info('PERFORMANCE', {
      ...this.context,
      ...metrics,
      performanceEvent: true,
      timestamp: new Date().toISOString(),
    })
    return this
  }

  /**
   * Log database operations
   */
  database(operation: string, duration: number, context?: LogContext): this {
    this.logger.info(`DATABASE: ${operation}`, {
      ...this.context,
      ...context,
      databaseEvent: true,
      operation,
      duration,
      timestamp: new Date().toISOString(),
    })
    return this
  }

  /**
   * Log authentication events
   */
  auth(event: string, success: boolean, context?: LogContext): this {
    this.logger.info(`AUTH: ${event}`, {
      ...this.context,
      ...context,
      authEvent: true,
      success,
      timestamp: new Date().toISOString(),
    })
    return this
  }

  /**
   * Log business events
   */
  business(event: string, data?: any, context?: LogContext): this {
    this.logger.info(`BUSINESS: ${event}`, {
      ...this.context,
      ...context,
      businessEvent: true,
      data,
      timestamp: new Date().toISOString(),
    })
    return this
  }

  /**
   * Log audit events (compliance)
   */
  audit(event: string, data?: any, context?: LogContext): this {
    this.logger.info(`AUDIT: ${event}`, {
      ...this.context,
      ...context,
      auditEvent: true,
      data,
      timestamp: new Date().toISOString(),
      compliance: true,
    })
    return this
  }

  /**
   * Log metrics for monitoring
   */
  metrics(metric: string, value: number, unit: string, context?: LogContext): this {
    this.logger.info(`METRIC: ${metric}`, {
      ...this.context,
      ...context,
      metricEvent: true,
      metric,
      value,
      unit,
      timestamp: new Date().toISOString(),
    })
    return this
  }

  /**
   * Log GDPR/CCPA compliance events
   */
  compliance(
    event: string,
    dataSubject?: string,
    dataCategory?: string,
    context?: LogContext,
  ): this {
    this.logger.info(`COMPLIANCE: ${event}`, {
      ...this.context,
      ...context,
      complianceEvent: true,
      dataSubject,
      dataCategory,
      timestamp: new Date().toISOString(),
      gdpr: true,
      ccpa: true,
    })
    return this
  }

  /**
   * Log observability events (OpenTelemetry ready)
   */
  observability(
    event: string,
    traceId?: string,
    spanId?: string,
    context?: LogContext,
  ): this {
    this.logger.info(`OBSERVABILITY: ${event}`, {
      ...this.context,
      ...context,
      observabilityEvent: true,
      traceId,
      spanId,
      timestamp: new Date().toISOString(),
    })
    return this
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): RitmoLogger {
    const childLogger = new RitmoLogger(this.logger)
    childLogger.setContext({ ...this.context, ...context })
    return childLogger
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default RitmoLogger
