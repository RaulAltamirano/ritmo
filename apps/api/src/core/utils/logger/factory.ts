/**
 * 🏭 LOGGER FACTORY - 2025 BEST PRACTICES
 *
 * Winston logger factory for creating configured logger instances
 * Environment-specific configurations with performance optimization
 */

import winston from 'winston'
import { LogLevels, LogColors } from './types.js'
import { LoggerFormats } from './formats.js'
import { createTransportsForEnvironment } from './transports.js'

// =============================================================================
// LOGGER FACTORY
// =============================================================================

export class LoggerFactory {
  /**
   * Create a configured Winston logger
   */
  static createLogger(environment = 'development'): winston.Logger {
    const isDevelopment = environment === 'development'

    // Add colors to Winston
    winston.addColors(LogColors)

    // Get transports for environment
    const { transports, exceptionHandlers } =
      createTransportsForEnvironment(environment)

    // Create logger instance
    const logger = winston.createLogger({
      level: isDevelopment ? 'debug' : 'info',
      levels: LogLevels,
      format: LoggerFormats.custom,
      transports,
      exitOnError: false,
      silent: false,
      // 2025 Best Practices: Async logging for better performance
      defaultMeta: {
        service: 'ritmo-api',
        version: process.env.npm_package_version ?? '1.0.0',
        environment,
      },
    })

    // Multiple transports (console + many DailyRotateFile) plus exception/rejection
    // handlers each attach stream listeners; default EventEmitter cap is 10.
    logger.setMaxListeners(32)

    // Handle uncaught exceptions and unhandled rejections
    logger.exceptions.handle(exceptionHandlers.exceptions)
    logger.rejections.handle(exceptionHandlers.rejections)

    return logger
  }

  /**
   * Create a logger with custom configuration
   */
  static createCustomLogger(options: {
    environment?: string
    level?: string
    service?: string
    version?: string
    transports?: winston.transport[]
    format?: any
  }): winston.Logger {
    const environment = options.environment ?? 'development'
    const isDevelopment = environment === 'development'

    // Add colors to Winston
    winston.addColors(LogColors)

    // Get default transports or use custom ones
    const { transports, exceptionHandlers } = options.transports
      ? {
          transports: options.transports,
          exceptionHandlers:
            createTransportsForEnvironment(environment).exceptionHandlers,
        }
      : createTransportsForEnvironment(environment)

    // Create logger instance
    const logger = winston.createLogger({
      level: options.level ?? (isDevelopment ? 'debug' : 'info'),
      levels: LogLevels,
      format: options.format ?? LoggerFormats.custom,
      transports,
      exitOnError: false,
      silent: false,
      defaultMeta: {
        service: options.service ?? 'ritmo-api',
        version: options.version ?? process.env.npm_package_version ?? '1.0.0',
        environment,
      },
    })

    logger.setMaxListeners(32)

    // Handle uncaught exceptions and unhandled rejections
    logger.exceptions.handle(exceptionHandlers.exceptions)
    logger.rejections.handle(exceptionHandlers.rejections)

    return logger
  }

  /**
   * Create a development logger with console output
   */
  static createDevelopmentLogger(): winston.Logger {
    return this.createLogger('development')
  }

  /**
   * Create a production logger without console output
   */
  static createProductionLogger(): winston.Logger {
    return this.createLogger('production')
  }

  /**
   * Create a test logger with minimal output
   */
  static createTestLogger(): winston.Logger {
    return this.createCustomLogger({
      environment: 'test',
      level: 'error',
      format: LoggerFormats.minimal,
    })
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default LoggerFactory
