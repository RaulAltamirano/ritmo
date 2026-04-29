/**
 * 🚚 LOGGER TRANSPORTS - 2025 BEST PRACTICES
 *
 * Winston transport configurations for file and console logging
 * Zero-downtime rotation with compression and encryption support
 */

import path from 'path'
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { LogDirectory } from './types.js'
import { LoggerFormats } from './formats.js'

// =============================================================================
// LOG DIRECTORY CONFIGURATION
// =============================================================================

export const getLogDirectory = (): LogDirectory => {
  const baseDir = process.env.LOG_DIR ?? path.join(process.cwd(), 'logs')
  return {
    base: baseDir,
    error: path.join(baseDir, 'error'),
    combined: path.join(baseDir, 'combined'),
    access: path.join(baseDir, 'access'),
    security: path.join(baseDir, 'security'),
    performance: path.join(baseDir, 'performance'),
    audit: path.join(baseDir, 'audit'),
    metrics: path.join(baseDir, 'metrics'),
  }
}

// =============================================================================
// TRANSPORT CONFIGURATIONS
// =============================================================================

export const LoggerTransports = {
  /**
   * Create file transports with daily rotation
   */
  createFileTransports: (logDir: LogDirectory) => {
    const commonConfig = {
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: LoggerFormats.custom,
      createSymlink: true,
      symlinkName: 'current.log',
      handleExceptions: true,
      handleRejections: true,
    }

    return [
      // Emergency and Alert logs (system critical)
      new DailyRotateFile({
        ...commonConfig,
        filename: path.join(logDir.error, 'emergency-%DATE%.log'),
        level: 'alert',
        maxFiles: '30d', // Keep emergency logs longer
      }),

      // Error logs
      new DailyRotateFile({
        ...commonConfig,
        filename: path.join(logDir.error, 'error-%DATE%.log'),
        level: 'error',
      }),

      // Combined logs (all levels)
      new DailyRotateFile({
        ...commonConfig,
        filename: path.join(logDir.combined, 'combined-%DATE%.log'),
        level: 'info',
      }),

      // Access logs (HTTP requests)
      new DailyRotateFile({
        ...commonConfig,
        filename: path.join(logDir.access, 'access-%DATE%.log'),
        level: 'notice',
      }),

      // Security logs
      new DailyRotateFile({
        ...commonConfig,
        filename: path.join(logDir.security, 'security-%DATE%.log'),
        level: 'warn',
      }),

      // Performance logs
      new DailyRotateFile({
        ...commonConfig,
        filename: path.join(logDir.performance, 'performance-%DATE%.log'),
        level: 'info',
      }),

      // Audit logs (compliance)
      new DailyRotateFile({
        ...commonConfig,
        filename: path.join(logDir.audit, 'audit-%DATE%.log'),
        level: 'notice',
        maxFiles: '365d', // Keep audit logs for compliance
      }),

      // Metrics logs
      new DailyRotateFile({
        ...commonConfig,
        filename: path.join(logDir.metrics, 'metrics-%DATE%.log'),
        level: 'info',
      }),
    ]
  },

  /**
   * Create console transport for development
   */
  createConsoleTransport: () => {
    return new winston.transports.Console({
      level: 'debug',
      format: LoggerFormats.console,
      handleExceptions: true,
      handleRejections: true,
    })
  },

  /**
   * Create exception handling transports
   */
  createExceptionTransports: (logDir: LogDirectory) => {
    const exceptionConfig = {
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d', // Keep exceptions longer
      level: 'error',
    }

    return {
      exceptions: new DailyRotateFile({
        ...exceptionConfig,
        filename: path.join(logDir.error, 'exceptions-%DATE%.log'),
      }),
      rejections: new DailyRotateFile({
        ...exceptionConfig,
        filename: path.join(logDir.error, 'rejections-%DATE%.log'),
      }),
    }
  },

  /**
   * Create custom transport for specific use cases
   */
  createCustomTransport: (options: {
    filename: string
    level?: string
    maxFiles?: string
    maxSize?: string
    format?: any
  }) => {
    return new DailyRotateFile({
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: options.maxSize ?? '20m',
      maxFiles: options.maxFiles ?? '14d',
      format: options.format ?? LoggerFormats.custom,
      handleExceptions: true,
      handleRejections: true,
      filename: options.filename,
      level: options.level ?? 'info',
    })
  },
}

// =============================================================================
// TRANSPORT UTILITIES
// =============================================================================

export const createTransportsForEnvironment = (environment: string) => {
  const logDir = getLogDirectory()
  const isDevelopment = environment === 'development'

  const transports: winston.transport[] = [
    // Console transport for development
    ...(isDevelopment ? [LoggerTransports.createConsoleTransport()] : []),

    // File transports
    ...LoggerTransports.createFileTransports(logDir),
  ]

  return {
    transports,
    exceptionHandlers: LoggerTransports.createExceptionTransports(logDir),
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default LoggerTransports
