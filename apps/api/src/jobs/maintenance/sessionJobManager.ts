/**
 * 🚀 SESSION JOB MANAGER - 2025 CENTRALIZED SESSION MANAGEMENT
 *
 * Coordinates all session-related background jobs for optimal performance
 * Ensures jobs don't conflict and run at optimal intervals
 */

import {
  runSecurityMonitoring,
  runSessionAnalytics,
  runSessionCleanup,
  runSessionRenewal,
} from './sessionCleanup.js'
import { runTokenCleanup } from './tokenCleanup.js'
import { runWorkSessionIdempotencyCleanup } from './workSessionIdempotencyCleanup.js'
import { runWorkSessionStaleAbandon } from './workSessionStaleAbandon.js'

/**
 * 🎯 Job Configuration - Optimized intervals for 2025
 */
const intervalHandles: Array<ReturnType<typeof setInterval>> = []

const JOB_CONFIG = {
  // High-frequency jobs (security critical)
  sessionCleanup: {
    interval: 15 * 60 * 1000, // 15 minutes
    description: 'Session expiration cleanup',
  },

  // Medium-frequency jobs (performance critical)
  sessionRenewal: {
    interval: 30 * 60 * 1000, // 30 minutes
    description: 'Session renewal for active users',
  },

  // Low-frequency jobs (maintenance)
  tokenCleanup: {
    interval: 60 * 60 * 1000, // 1 hour
    description: 'Comprehensive token and orphaned data cleanup',
  },

  // Analysis jobs (non-critical)
  securityMonitoring: {
    interval: 2 * 60 * 60 * 1000, // 2 hours
    description: 'Security threat monitoring',
  },

  sessionAnalytics: {
    interval: 6 * 60 * 60 * 1000, // 6 hours
    description: 'Session analytics and reporting',
  },

  workSessionStaleAbandon: {
    interval: 5 * 60 * 1000, // 5 minutes
    description: 'Abandon stale work timer sessions (no heartbeat)',
  },

  workSessionIdempotencyCleanup: {
    interval: 60 * 60 * 1000, // 1 hour
    description: 'Remove work-session complete idempotency keys older than 24h',
  },
}

/**
 * 🚀 Initialize all session management jobs
 * Coordinates timing to avoid conflicts and optimize performance
 */
export function initializeAllSessionJobs(): void {
  try {
    // 1. Session Cleanup - High priority (15 min)
    intervalHandles.push(
      setInterval(() => void runSessionCleanup(), JOB_CONFIG.sessionCleanup.interval),
    )

    // 2. Session Renewal - Medium priority (30 min)
    intervalHandles.push(
      setInterval(() => void runSessionRenewal(), JOB_CONFIG.sessionRenewal.interval),
    )

    // 3. Token Cleanup - Medium priority (1 hour)
    intervalHandles.push(
      setInterval(() => void runTokenCleanup(), JOB_CONFIG.tokenCleanup.interval),
    )

    // 4. Security Monitoring - Low priority (2 hours)
    intervalHandles.push(
      setInterval(
        () => void runSecurityMonitoring(),
        JOB_CONFIG.securityMonitoring.interval,
      ),
    )

    // 5. Session Analytics - Low priority (6 hours)
    intervalHandles.push(
      setInterval(
        () => void runSessionAnalytics(),
        JOB_CONFIG.sessionAnalytics.interval,
      ),
    )

    // 6. Work session stale abandon (5 min)
    intervalHandles.push(
      setInterval(
        () => void runWorkSessionStaleAbandon(),
        JOB_CONFIG.workSessionStaleAbandon.interval,
      ),
    )

    intervalHandles.push(
      setInterval(
        () => void runWorkSessionIdempotencyCleanup(),
        JOB_CONFIG.workSessionIdempotencyCleanup.interval,
      ),
    )

    // Run initial jobs immediately
    void Promise.allSettled([
      runSessionCleanup(),
      runSessionRenewal(),
      runTokenCleanup(),
      runSecurityMonitoring(),
      runSessionAnalytics(),
      runWorkSessionStaleAbandon(),
      runWorkSessionIdempotencyCleanup(),
    ]).then(results => {
      const failed = results.filter(r => r.status === 'rejected').length
      // Log only critical information
      if (failed > 0) {
        console.error(`[SESSION JOBS] ${failed} initial jobs failed`)
      }
    })
  } catch (error) {
    console.error('[SESSION JOBS] Failed to initialize session jobs:', error)
    throw error
  }
}

/**
 * 🛑 Stop all session management jobs
 * Useful for graceful shutdown
 */
export function stopAllSessionJobs(): void {
  for (const id of intervalHandles) {
    clearInterval(id)
  }
  intervalHandles.length = 0
}

/**
 * 📊 Get job status and statistics
 * Useful for monitoring and debugging
 */
export function getJobStatus(): {
  totalJobs: number
  jobConfig: typeof JOB_CONFIG
  status: 'running' | 'stopped'
} {
  return {
    totalJobs: Object.keys(JOB_CONFIG).length,
    jobConfig: JOB_CONFIG,
    status: 'running',
  }
}

/**
 * 🔄 Manual trigger for all jobs
 * Useful for testing or maintenance
 */
export async function triggerAllJobs(): Promise<{
  success: boolean
  results: any[]
  timestamp: Date
}> {
  const results = await Promise.allSettled([
    runSessionCleanup(),
    runSessionRenewal(),
    runTokenCleanup(),
    runSecurityMonitoring(),
    runSessionAnalytics(),
    runWorkSessionStaleAbandon(),
    runWorkSessionIdempotencyCleanup(),
  ])

  const failed = results.filter(r => r.status === 'rejected').length

  return {
    success: failed === 0,
    results: results.map(r => (r.status === 'fulfilled' ? r.value : r.reason)),
    timestamp: new Date(),
  }
}
