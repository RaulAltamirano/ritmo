/**
 * 🚀 RITMO TOKEN REFRESH CONFIGURATION
 *
 * Centralized configuration for token refresh behavior
 */

export const TOKEN_REFRESH_CONFIG = {
  timing: {
    minRefreshInterval: 5 * 60 * 1000, // 5 minutes after a successful refresh
    failureBackoffMs: 30 * 1000,
    proactiveCheckInterval: 60 * 1000, // Check every minute
    maxRefreshAttempts: 10,
    expirationBuffer: 2 * 60 * 1000, // 2 minutes
  },
  retry: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 8000,
    jitterRange: 500,
  },
  security: {
    enableDeviceFingerprinting: true,
    requireUserActivity: true,
    maxConcurrentRefreshes: 1,
    enableDeviceValidation: true,
    enableRateLimiting: true,
    maxRefreshAttemptsPerMinute: 5,
    enableSecurityLogging: true,
  },
  logging: {
    enableDebugLogs: process.env.NODE_ENV === 'development',
    logRefreshAttempts: true,
    logErrors: true,
  },
} as const

export type TokenRefreshConfig = typeof TOKEN_REFRESH_CONFIG
