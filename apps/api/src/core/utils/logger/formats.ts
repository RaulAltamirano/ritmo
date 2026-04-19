/**
 * 🎨 LOGGER FORMATS - 2025 BEST PRACTICES
 *
 * Winston format configurations for structured logging
 * ISO 8601 compliant with enhanced metadata support
 */

import os from 'os'
import winston from 'winston'

// =============================================================================
// ENHANCED FORMATS - 2025 STANDARDS
// =============================================================================

export const LoggerFormats = {
  /**
   * Custom JSON format with enhanced metadata
   */
  custom: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DDTHH:mm:ss.SSSZ', // ISO 8601 compliant
    }),
    winston.format.errors({ stack: true }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
    winston.format.json(),
    winston.format.printf(
      ({ timestamp, level, message, stack, metadata, ...meta }: any) => {
        const logEntry: any = {
          timestamp,
          level: level.toUpperCase(),
          message,
          service: 'ritmo-api',
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          hostname: os.hostname(),
          pid: process.pid,
          ...meta,
          ...metadata,
        }

        if (stack) {
          logEntry.stack = stack
        }

        // Add performance metrics if available
        if (process.memoryUsage) {
          const memUsage = process.memoryUsage()
          logEntry.memory = {
            rss: Math.round(memUsage.rss / 1024 / 1024), // MB
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
            external: Math.round(memUsage.external / 1024 / 1024), // MB
          }
        }

        return JSON.stringify(logEntry, null, 2)
      },
    ),
  ),

  /**
   * Console format for development
   */
  console: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({
      format: 'HH:mm:ss.SSS',
    }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
      return `[${timestamp}] ${level}: ${message}${metaStr}`
    }),
  ),

  /**
   * Simple format for basic logging
   */
  simple: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),

  /**
   * Minimal format for performance-critical scenarios
   */
  minimal: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level.toUpperCase()}: ${message}`
    }),
  ),
}

// =============================================================================
// FORMAT UTILITIES
// =============================================================================

export const createCustomFormat = (options: {
  service?: string
  version?: string
  environment?: string
  includeMemory?: boolean
  includeHostname?: boolean
}) => {
  return winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
    }),
    winston.format.errors({ stack: true }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
    winston.format.json(),
    winston.format.printf(
      ({ timestamp, level, message, stack, metadata, ...meta }: any) => {
        const logEntry: any = {
          timestamp,
          level: level.toUpperCase(),
          message,
          service: options.service || 'ritmo-api',
          version: options.version || process.env.npm_package_version || '1.0.0',
          environment: options.environment || process.env.NODE_ENV || 'development',
          ...meta,
          ...metadata,
        }

        if (options.includeHostname !== false) {
          logEntry.hostname = os.hostname()
        }

        if (options.includeHostname !== false) {
          logEntry.pid = process.pid
        }

        if (stack) {
          logEntry.stack = stack
        }

        if (options.includeMemory !== false && process.memoryUsage) {
          const memUsage = process.memoryUsage()
          logEntry.memory = {
            rss: Math.round(memUsage.rss / 1024 / 1024),
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
            external: Math.round(memUsage.external / 1024 / 1024),
          }
        }

        return JSON.stringify(logEntry, null, 2)
      },
    ),
  )
}

// =============================================================================
// EXPORTS
// =============================================================================

export default LoggerFormats
