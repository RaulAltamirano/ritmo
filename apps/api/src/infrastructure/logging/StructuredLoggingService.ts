/**
 * 📝 STRUCTURED LOGGING SERVICE - RITMO API 2025
 *
 * Centralized logging service for audit trails and security monitoring
 * Implements structured logging with different levels and contexts
 */

import { PrismaClient } from '@prisma/client'

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug' | 'security'
  message: string
  context: {
    userId?: string
    sessionId?: string
    ipAddress?: string
    userAgent?: string
    endpoint?: string
    method?: string
    requestId?: string
  }
  metadata?: Record<string, any>
  timestamp: Date
  environment: string
}

export interface SecurityEvent {
  eventType:
    | 'login_success'
    | 'login_failed'
    | 'logout'
    | 'session_created'
    | 'session_revoked'
    | 'password_change'
    | 'account_locked'
    | 'suspicious_activity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  details: string
  metadata?: Record<string, any>
}

export class StructuredLoggingService {
  private prisma: PrismaClient
  private isDevelopment: boolean

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  /**
   * 🔐 Log security events with structured data
   */
  async logSecurityEvent(
    eventType: SecurityEvent['eventType'],
    userId: string | null,
    sessionId: string | null,
    ipAddress: string | null,
    userAgent: string | null,
    details: string,
    severity: SecurityEvent['severity'] = 'medium',
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      // Create security log entry in database
      await this.prisma.securityLog.create({
        data: {
          userId: userId || null,
          sessionId: sessionId || null,
          eventType,
          severity,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
          eventDescription: details,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      })

      // Console logging for development
      if (this.isDevelopment) {
        const logMessage = `[SECURITY ${severity.toUpperCase()}] ${eventType}: ${details}`
        const logData = {
          userId,
          sessionId,
          ipAddress,
          userAgent,
          metadata,
        }

        switch (severity) {
          case 'critical':
          case 'high':
            console.error(logMessage, logData)
            break
          case 'medium':
            console.warn(logMessage, logData)
            break
          default:
            console.log(logMessage, logData)
        }
      }

      // TODO: Send to external monitoring service in production
      // await this.sendToMonitoringService(eventType, severity, details, metadata)
    } catch (error) {
      // Fallback to console logging if database fails
      console.error('Failed to log security event:', error)
      console.error('Event details:', {
        eventType,
        userId,
        sessionId,
        ipAddress,
        userAgent,
        details,
        severity,
        metadata,
      })
    }
  }

  /**
   * 📊 Log application events with structured data
   */
  async logApplicationEvent(
    level: LogEntry['level'],
    message: string,
    context: LogEntry['context'],
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      const logEntry: LogEntry = {
        level,
        message,
        context,
        metadata,
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development',
      }

      // Console logging for development
      if (this.isDevelopment) {
        const logMessage = `[${level.toUpperCase()}] ${message}`
        console.log(logMessage, { context, metadata })
      }

      // TODO: Send to external logging service in production
      // await this.sendToLoggingService(logEntry)
    } catch (error) {
      console.error('Failed to log application event:', error)
    }
  }

  /**
   * 🚨 Log session management events
   */
  async logSessionEvent(
    eventType: 'session_created' | 'session_expired' | 'session_revoked',
    userId: string,
    sessionId: string,
    ipAddress?: string,
    userAgent?: string,
    details?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.logSecurityEvent(
      eventType as any,
      userId,
      sessionId,
      ipAddress || null,
      userAgent || null,
      details || `Session ${eventType.replace('_', ' ')}`,
      'medium',
      metadata,
    )
  }

  /**
   * 🔍 Log authentication events
   */
  async logAuthEvent(
    eventType:
      | 'login_success'
      | 'login_failed'
      | 'logout'
      | 'register'
      | 'password_change'
      | 'password_reset',
    userId: string | null,
    sessionId: string | null,
    ipAddress?: string,
    userAgent?: string,
    details?: string,
    severity: SecurityEvent['severity'] = 'medium',
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.logSecurityEvent(
      eventType,
      userId,
      sessionId,
      ipAddress || null,
      userAgent || null,
      details || `Authentication event: ${eventType}`,
      severity,
      metadata,
    )
  }

  /**
   * 📈 Log performance metrics
   */
  async logPerformanceMetric(
    metric: string,
    value: number,
    unit: string,
    context: LogEntry['context'],
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.logApplicationEvent(
      'info',
      `Performance metric: ${metric} = ${value}${unit}`,
      context,
      { metric, value, unit, ...metadata },
    )
  }

  /**
   * 🔄 Log API request/response events
   */
  async logApiEvent(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    userId?: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const level = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'info'

    await this.logApplicationEvent(
      level,
      `API ${method} ${endpoint} - ${statusCode} (${duration}ms)`,
      {
        userId,
        sessionId,
        ipAddress,
        userAgent,
        endpoint,
        method,
      },
      {
        statusCode,
        duration,
        ...metadata,
      },
    )
  }

  /**
   * 🧹 Clean up old logs (called by maintenance jobs)
   */
  async cleanupOldLogs(retentionDays = 90): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

      const result = await this.prisma.securityLog.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      })

      return result.count
    } catch (error) {
      console.error('Failed to cleanup old logs:', error)
      return 0
    }
  }

  /**
   * 📊 Get log statistics for monitoring
   */
  async getLogStats(timeRange: { start: Date; end: Date }): Promise<{
    totalLogs: number
    securityEvents: number
    errors: number
    eventsBySeverity: Record<string, number>
  }> {
    try {
      const logs = await this.prisma.securityLog.findMany({
        where: {
          timestamp: {
            gte: timeRange.start,
            lte: timeRange.end,
          },
        },
      })

      const eventsBySeverity = logs.reduce(
        (acc, log) => {
          acc[log.severity] = (acc[log.severity] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      return {
        totalLogs: logs.length,
        securityEvents: logs.length,
        errors: logs.filter(
          log => log.severity === 'high' || log.severity === 'critical',
        ).length,
        eventsBySeverity,
      }
    } catch (error) {
      console.error('Failed to get log stats:', error)
      return {
        totalLogs: 0,
        securityEvents: 0,
        errors: 0,
        eventsBySeverity: {},
      }
    }
  }
}

// Export singleton instance
export const structuredLogging = new StructuredLoggingService(new PrismaClient())
