/**
 * 📋 LOGGER TYPES - 2025 BEST PRACTICES
 *
 * Type definitions for the RitmoLogger system
 * RFC 5424 compliant with enhanced observability
 */

// =============================================================================
// LOG LEVELS - RFC 5424 COMPLIANT
// =============================================================================

export const LogLevels = {
  emergency: 0, // System is unusable
  alert: 1, // Action must be taken immediately
  critical: 2, // Critical conditions
  error: 3, // Error conditions
  warn: 4, // Warning conditions
  notice: 5, // Normal but significant condition
  info: 6, // Informational messages
  debug: 7, // Debug-level messages
} as const

export const LogColors = {
  emergency: 'red',
  alert: 'red',
  critical: 'red',
  error: 'red',
  warn: 'yellow',
  notice: 'blue',
  info: 'green',
  debug: 'cyan',
} as const

// =============================================================================
// INTERFACES
// =============================================================================

export interface LogContext {
  requestId?: string
  userId?: string
  sessionId?: string
  ip?: string
  userAgent?: string
  method?: string
  path?: string
  statusCode?: number
  duration?: number
  error?: Error
  metadata?: Record<string, any>
  headers?: Record<string, any>
  body?: any
  query?: any
  params?: any
  responseSize?: number
  // 2025 Best Practices: Enhanced context
  correlationId?: string
  traceId?: string
  spanId?: string
  tenantId?: string
  feature?: string
  component?: string
  operation?: string
  // GDPR/CCPA Compliance
  dataSubject?: string
  dataCategory?: string
  retentionPeriod?: number
  // Performance metrics
  memoryUsage?: NodeJS.MemoryUsage
  cpuUsage?: number
  // Security context
  securityLevel?: 'low' | 'medium' | 'high' | 'critical'
  threatLevel?: 'none' | 'low' | 'medium' | 'high' | 'critical'
}

export interface PerformanceMetrics {
  operation: string
  duration: number
  memory?: NodeJS.MemoryUsage
  cpu?: number
  metadata?: Record<string, any>
}

export interface LogDirectory {
  base: string
  error: string
  combined: string
  access: string
  security: string
  performance: string
  audit: string
  metrics: string
}

export interface LoggerConfig {
  level: string
  console: boolean
  file: boolean
  colors: boolean
  timestamp: boolean
  structured: boolean
  async: boolean
  compression?: boolean
  encryption?: boolean
}

// =============================================================================
// TYPE UTILITIES
// =============================================================================

export type LogLevel = keyof typeof LogLevels
export type LogColor = keyof typeof LogColors
export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical'
export type ThreatLevel = 'none' | 'low' | 'medium' | 'high' | 'critical'

// =============================================================================
// EXPORTS
// =============================================================================

export { LogColors as logColors, LogLevels as logLevels }
