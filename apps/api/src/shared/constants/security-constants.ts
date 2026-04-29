/**
 * 🔐 RITMO SECURITY CONSTANTS
 *
 * Centralized security configuration for the entire application
 * Updated with 2025 best practices for maximum security
 */

import { createHash, randomBytes } from 'crypto'

export const SECURITY_CONSTANTS = {
  // Token Configuration
  TOKEN: {
    ACCESS_EXPIRY: '15m',
    REFRESH_EXPIRY: '7d',
    MAX_REFRESH_ATTEMPTS: 5,
    ROTATION_ENABLED: true,
    FAMILY_SIZE_LIMIT: 10,
  },

  // Device Validation
  DEVICE: {
    MAX_VALIDATION_ATTEMPTS_PER_HOUR: 10,
    TRUST_THRESHOLD: 0.8,
    ANOMALY_DETECTION_ENABLED: true,
    FINGERPRINT_EXPIRY: '30d',
    CHALLENGE_TIMEOUT: '5m',
  },

  // Rate Limiting
  RATE_LIMIT: {
    LOGIN_ATTEMPTS_PER_15MIN: 5,
    REGISTER_ATTEMPTS_PER_HOUR: 3,
    PASSWORD_RESET_PER_HOUR: 2,
    API_REQUESTS_PER_MINUTE: 100,
    AUTH_ENDPOINTS_PER_15MIN: 10,
  },

  // Session Management
  SESSION: {
    MAX_ACTIVE_SESSIONS: 5,
    INACTIVITY_TIMEOUT: '30m',
    ABSOLUTE_TIMEOUT: '24h',
    CLEANUP_INTERVAL: '1h',
    SUSPICIOUS_ACTIVITY_THRESHOLD: 3,
  },

  // Password Security
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    HISTORY_SIZE: 5,
    MAX_AGE_DAYS: 90,
  },

  // Security Headers
  HEADERS: {
    CSP_NONCE_LENGTH: 32,
    HSTS_MAX_AGE: 31536000,
    HSTS_INCLUDE_SUBDOMAINS: true,
    HSTS_PRELOAD: true,
  },

  // Audit & Logging
  AUDIT: {
    LOG_RETENTION_DAYS: 365,
    SENSITIVE_FIELDS: ['password', 'token', 'secret'],
    ANONYMIZE_IPS: false,
    LOG_LEVEL: 'info',
  },

  // Environment-specific settings
  ENVIRONMENT: {
    DEVELOPMENT: {
      DEBUG_ENABLED: true,
      CORS_RELAXED: true,
      RATE_LIMIT_DISABLED: false,
    },
    PRODUCTION: {
      DEBUG_ENABLED: false,
      CORS_STRICT: true,
      RATE_LIMIT_ENFORCED: true,
    },
  },
} as const

// Type definitions for better type safety
export type SecurityEventType =
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'register'
  | 'password_change'
  | 'password_reset_request'
  | 'password_reset_complete'
  | 'two_factor_enabled'
  | 'two_factor_disabled'
  | 'two_factor_verification'
  | 'session_created'
  | 'session_expired'
  | 'session_revoked'
  | 'token_refreshed'
  | 'token_revoked'
  | 'token_expired'
  | 'suspicious_activity'
  | 'brute_force_attempt'
  | 'account_locked'
  | 'device_validation_attempt'
  | 'device_validation_success'
  | 'device_validation_failed'
  | 'profile_updated'
  | 'security_settings_changed'
  | 'admin_action'
  | 'system_event'

export type SecuritySeverity = 'info' | 'low' | 'medium' | 'high' | 'critical'

export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'tv' | 'wearable' | 'other'

// Security validation functions
export const SecurityValidators = {
  isValidPassword: (password: string): boolean => {
    const {
      MIN_LENGTH,
      REQUIRE_UPPERCASE,
      REQUIRE_LOWERCASE,
      REQUIRE_NUMBERS,
      REQUIRE_SPECIAL_CHARS,
    } = SECURITY_CONSTANTS.PASSWORD

    if (password.length < MIN_LENGTH) return false
    if (REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) return false
    if (REQUIRE_LOWERCASE && !/[a-z]/.test(password)) return false
    if (REQUIRE_NUMBERS && !/\d/.test(password)) return false
    if (REQUIRE_SPECIAL_CHARS && !/[@$!%*?&]/.test(password)) return false

    return true
  },

  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  isStrongJWTSecret: (secret: string): boolean => {
    return (
      secret.length >= 32 && /[A-Za-z0-9@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(secret)
    )
  },

  isTrustedOrigin: (origin: string, allowedOrigins: string[]): boolean => {
    return (
      allowedOrigins.includes(origin) ||
      (process.env.NODE_ENV === 'development' && origin.includes('localhost'))
    )
  },
}

// Security utility functions
export const SecurityUtils = {
  generateSecureToken: (length = 32): string => {
    return randomBytes(length).toString('hex')
  },

  hashSensitiveData: (data: string): string => {
    return createHash('sha256').update(data).digest('hex')
  },

  sanitizeInput: (input: string): string => {
    return input.replace(/[<>"'&]/g, '')
  },

  maskSensitiveData: (data: string, visibleChars = 4): string => {
    if (data.length <= visibleChars * 2) return '*'.repeat(data.length)
    return (
      data.substring(0, visibleChars) +
      '*'.repeat(data.length - visibleChars * 2) +
      data.substring(data.length - visibleChars)
    )
  },
}
