/**
 * 🧹 TOKEN & SESSION CLEANUP JOB - 2025 INTEGRATED SESSION MANAGEMENT
 *
 * Integrated with the new SessionService for comprehensive cleanup
 * Automatically cleans expired tokens and sessions to maintain database performance
 */

import { PrismaClient } from '@prisma/client'
import { SessionService } from '../../infrastructure/security/SessionService.js'

const prisma = new PrismaClient()
const sessionService = new SessionService(prisma)

/**
 * 🧹 Comprehensive cleanup of expired tokens and sessions
 * This should run every hour to maintain optimal performance
 */
export async function runTokenCleanup(): Promise<{
  success: boolean
  results: {
    expiredSessions: number
    cleanedSessions: number
    activeSessions: number
    oldSecurityLogs: number
  }
  timestamp: Date
}> {
  try {
    // 1. Handle session expiration using the new SessionService
    const sessionResults = await sessionService.handleSessionExpiration()

    // 2. Clean up old security logs (older than 90 days)
    const oldSecurityLogs = await cleanupOldSecurityLogs()

    // 3. Clean up any orphaned tokens or sessions
    const orphanedCleanup = await cleanupOrphanedData()

    const results = {
      expiredSessions: sessionResults.expiredSessions,
      cleanedSessions: sessionResults.cleanedSessions,
      activeSessions: sessionResults.activeSessions,
      oldSecurityLogs: oldSecurityLogs + orphanedCleanup,
    }

    return {
      success: true,
      results,
      timestamp: new Date(),
    }
  } catch {
    return {
      success: false,
      results: {
        expiredSessions: 0,
        cleanedSessions: 0,
        activeSessions: 0,
        oldSecurityLogs: 0,
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
  } catch {
    return 0
  }
}

/**
 * 🧹 Clean up orphaned or invalid data
 * Removes any data that might be left behind
 */
async function cleanupOrphanedData(): Promise<number> {
  try {
    let totalCleaned = 0

    // `userSession.userId` is a required FK to `User`; Prisma cannot express "user missing"
    // without raw SQL. Skip bulk orphan cleanup here.
    const orphanedSessions = { count: 0 }

    totalCleaned += orphanedSessions.count

    // 2. Clean up security logs without valid sessions
    const orphanedSecurityLogs = await prisma.securityLog.deleteMany({
      where: {
        sessionId: {
          notIn: (
            await prisma.userSession.findMany({
              select: { id: true },
            })
          ).map(s => s.id),
        },
      },
    })

    totalCleaned += orphanedSecurityLogs.count

    return totalCleaned
  } catch {
    return 0
  }
}

/**
 * 🚀 Initialize cleanup scheduler
 * Runs cleanup every hour (3600000 milliseconds)
 */
export function initializeTokenCleanup(): void {
  // Run cleanup immediately on startup
  void runTokenCleanup()

  // Schedule cleanup every hour
  setInterval(() => void runTokenCleanup(), 60 * 60 * 1000) // 1 hour
}

/**
 * 🔄 Manual cleanup trigger
 * Useful for testing or manual maintenance
 */
export async function triggerManualCleanup(): Promise<any> {
  return runTokenCleanup()
}
