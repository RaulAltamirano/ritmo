/**
 * 🕐 SESSION CLEANUP JOB - 2025 AUTOMATED SESSION MANAGEMENT
 *
 * Runs periodically to maintain session hygiene and security
 */

import { PrismaClient } from '@prisma/client'
import { SessionService } from '../../infrastructure/security/SessionService.js'

const prisma = new PrismaClient()
const sessionService = new SessionService(prisma)

/**
 * 🧹 Main Session Cleanup Job
 * Runs every 15 minutes to clean expired sessions
 */
export async function runSessionCleanup(): Promise<{
  success: boolean
  results: {
    expiredSessions: number
    cleanedSessions: number
    activeSessions: number
    securityEvents: number
  }
  timestamp: Date
}> {
  try {
    // 1. Handle session expiration
    const expirationResults = await sessionService.handleSessionExpiration()

    // 2. Clean up old security logs (older than 90 days)
    const securityLogsCleaned = await cleanupOldSecurityLogs()

    // 3. Generate cleanup report
    const report = {
      expiredSessions: expirationResults.expiredSessions,
      cleanedSessions: expirationResults.cleanedSessions,
      activeSessions: expirationResults.activeSessions,
      securityEvents: securityLogsCleaned,
    }

    return {
      success: true,
      results: report,
      timestamp: new Date(),
    }
  } catch (error) {
    return {
      success: false,
      results: {
        expiredSessions: 0,
        cleanedSessions: 0,
        activeSessions: 0,
        securityEvents: 0,
      },
      timestamp: new Date(),
    }
  }
}

/**
 * 🗑️ Clean up old security logs
 * Removes logs older than 90 days to maintain performance
 */
async function cleanupOldSecurityLogs(): Promise<number> {
  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

    const result = await prisma.securityLog.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo,
        },
      },
    })

    return result.count
  } catch (error) {
    return 0
  }
}

/**
 * 🔄 Session Renewal Job
 * Checks for sessions that need renewal and extends them
 */
export async function runSessionRenewal(): Promise<{
  success: boolean
  renewedSessions: number
  failedRenewals: number
  timestamp: Date
}> {
  try {
    // Find sessions that expire in the next 30 minutes
    const sessionsToRenew = await prisma.userSession.findMany({
      where: {
        isActive: true,
        expiresAt: {
          gt: new Date(),
          lt: new Date(Date.now() + 30 * 60 * 1000), // Next 30 minutes
        },
      },
    })

    let renewedSessions = 0
    let failedRenewals = 0

    // Renew each session
    for (const session of sessionsToRenew) {
      try {
        const result = await sessionService.renewSessionIfNeeded(session.id)
        if (result.renewed) {
          renewedSessions++
        }
      } catch (error) {
        failedRenewals++
      }
    }

    return {
      success: true,
      renewedSessions,
      failedRenewals,
      timestamp: new Date(),
    }
  } catch (error) {
    return {
      success: false,
      renewedSessions: 0,
      failedRenewals: 0,
      timestamp: new Date(),
    }
  }
}

/**
 * 🚨 Security Monitoring Job
 * Runs security checks on active sessions
 */
export async function runSecurityMonitoring(): Promise<{
  success: boolean
  threatsDetected: number
  highRiskSessions: number
  timestamp: Date
}> {
  try {
    // Get all active sessions
    const activeSessions = await prisma.userSession.findMany({
      where: {
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    })

    let threatsDetected = 0
    let highRiskSessions = 0

    // Check each session for security threats
    for (const session of activeSessions) {
      try {
        const threats = await sessionService.detectSecurityThreats(session.id, {
          ipAddress: session.ipAddress || 'unknown',
          userAgent: session.userAgent || 'unknown',
          timestamp: new Date(),
        })

        if (threats.threats.length > 0) {
          threatsDetected++

          if (threats.riskLevel === 'high' || threats.riskLevel === 'critical') {
            highRiskSessions++
          }
        }
      } catch (error) {
        // Handle session check error silently
      }
    }

    return {
      success: true,
      threatsDetected,
      highRiskSessions,
      timestamp: new Date(),
    }
  } catch (error) {
    return {
      success: false,
      threatsDetected: 0,
      highRiskSessions: 0,
      timestamp: new Date(),
    }
  }
}

/**
 * 📊 Session Analytics Job
 * Generates periodic session reports
 */
export async function runSessionAnalytics(): Promise<{
  success: boolean
  reportsGenerated: number
  timestamp: Date
}> {
  try {
    // Get all users with active sessions
    const usersWithSessions = await prisma.userSession.groupBy({
      by: ['userId'],
      where: {
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    })

    let reportsGenerated = 0

    // Generate report for each user
    for (const userSession of usersWithSessions) {
      try {
        const timeRange = {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          end: new Date(),
        }

        await sessionService.generateSessionReport(userSession.userId, timeRange)
        reportsGenerated++
      } catch (error) {
        // Handle report generation error silently
      }
    }

    return {
      success: true,
      reportsGenerated,
      timestamp: new Date(),
    }
  } catch (error) {
    return {
      success: false,
      reportsGenerated: 0,
      timestamp: new Date(),
    }
  }
}

/**
 * 🚀 Main Job Runner
 * Executes all session management jobs
 */
export async function runAllSessionJobs(): Promise<{
  cleanup: any
  renewal: any
  security: any
  analytics: any
  timestamp: Date
}> {
  const startTime = Date.now()

  // Run all jobs in parallel
  const [cleanup, renewal, security, analytics] = await Promise.allSettled([
    runSessionCleanup(),
    runSessionRenewal(),
    runSecurityMonitoring(),
    runSessionAnalytics(),
  ])

  const endTime = Date.now()
  const duration = endTime - startTime

  return {
    cleanup:
      cleanup.status === 'fulfilled'
        ? cleanup.value
        : { success: false, error: cleanup.reason },
    renewal:
      renewal.status === 'fulfilled'
        ? renewal.value
        : { success: false, error: renewal.reason },
    security:
      security.status === 'fulfilled'
        ? security.value
        : { success: false, error: security.reason },
    analytics:
      analytics.status === 'fulfilled'
        ? analytics.value
        : { success: false, error: analytics.reason },
    timestamp: new Date(),
  }
}
