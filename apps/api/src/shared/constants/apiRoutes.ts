/**
 * 🚀 RITMO API ROUTES - 2025 MODERN BEST PRACTICES
 *
 * Centralized route definitions following modern conventions:
 * - Clean URL structure without double slashes
 * - RESTful naming conventions
 * - Consistent endpoint patterns
 * - Easy maintenance and scalability
 */

export const API_ROUTES = {
  // Base API path
  BASE: '/api',

  // Health & Status endpoints
  HEALTH: {
    BASE: '/health',
    STATUS: '/status',
    AUTH_STATUS: '/auth-status',
    CONFIG_HEALTH: '/config-health',
  },

  // Authentication endpoints
  AUTH: {
    BASE: '/auth',
    LOGIN: '/login',
    REGISTER: '/register',
    REFRESH: '/refresh',
    LOGOUT: '/logout',
    LOGOUT_ALL: '/logout-all',
    ME: '/me',
    SESSIONS: '/sessions',
    TERMINATE_SESSION: (sessionId: string) => `/sessions/${sessionId}`,
    SECURITY_LOGS: '/security-logs',
    PASSWORD_RESET_REQUEST: '/password-reset-request',
    PASSWORD_RESET: '/password-reset',
    MFA: {
      SETUP: '/mfa/setup',
      VERIFY: '/mfa/verify',
      DISABLE: '/mfa/disable',
    },
  },

  // Circadian Rhythm endpoints
  CIRCADIAN: {
    BASE: '/circadian',
    PHASES: '/phases',
    PHASE_BY_ID: (id: string) => `/phases/${id}`,
    CATEGORIES: '/categories',
    CATEGORY_BY_NAME: (name: string) => `/categories/${name}`,
    CURRENT_PHASE: '/current-phase',
    RECOMMENDATIONS: '/recommendations',
    SESSIONS: '/sessions',
  },

  // User Management endpoints
  USERS: {
    BASE: '/users',
    PROFILE: '/profile',
    SETTINGS: '/settings',
    PREFERENCES: '/preferences',
    PREFERENCES_THEME: '/preferences/theme',
    AVATAR: '/avatar',
    BY_ID: (id: string) => `/${id}`,
    UPDATE: (id: string) => `/${id}`,
    DELETE: (id: string) => `/${id}`,
  },

  // Task Management endpoints
  TASKS: {
    BASE: '/tasks',
    LIST: '/',
    CREATE: '/',
    BY_ID: (id: string) => `/${id}`,
    UPDATE: (id: string) => `/${id}`,
    DELETE: (id: string) => `/${id}`,
    STATS: '/stats',
    TODAY: '/today',
    COMPLETED: '/completed',
    PENDING: '/pending',
  },

  // Activity Tracking endpoints
  ACTIVITIES: {
    BASE: '/activities',
    LIST: '/',
    CREATE: '/',
    BY_ID: (id: string) => `/${id}`,
    UPDATE: (id: string) => `/${id}`,
    DELETE: (id: string) => `/${id}`,
    TODAY: '/today',
    STATS: '/stats',
    TIMELINE: '/timeline',
  },

  // Plan Management endpoints
  PLANS: {
    BASE: '/plans',
    LIST: '/',
    CREATE: '/',
    BY_ID: (id: string) => `/${id}`,
    UPDATE: (id: string) => `/${id}`,
    DELETE: (id: string) => `/${id}`,
    TASKS: (id: string) => `/${id}/tasks`,
  },

  // Session Management endpoints
  SESSIONS: {
    BASE: '/sessions',
    LIST: '/',
    CREATE: '/',
    BY_ID: (id: string) => `/${id}`,
    UPDATE: (id: string) => `/${id}`,
    DELETE: (id: string) => `/${id}`,
    ACTIVE: '/active',
    COMPLETED: '/completed',
    STATS: '/stats',
  },

  // Analytics & Reporting endpoints
  ANALYTICS: {
    BASE: '/analytics',
    PRODUCTIVITY: '/productivity',
    TIME_TRACKING: '/time-tracking',
    USER_STATS: '/user-stats',
    PROJECT_STATS: '/project-stats',
    EXPORT: '/export',
    DASHBOARD: '/dashboard',
  },

  // Documentation endpoints
  DOCS: {
    BASE: '/docs',
    OPENAPI: '/openapi',
    SWAGGER: '/swagger',
    REDOC: '/redoc',
  },
} as const

/**
 * Helper function to build complete API URLs
 * Ensures no double slashes and proper formatting
 */
export const buildApiUrl = (base: string, ...parts: string[]): string => {
  const cleanParts = [base, ...parts]
    .filter(part => part && part !== '/')
    .map(part => part.replace(/^\/+|\/+$/g, '')) // Remove leading/trailing slashes

  return `/${cleanParts.join('/')}`
}

/**
 * Helper function to build relative URLs for router mounting
 * Used internally by routers
 */
export const buildRelativeUrl = (...parts: string[]): string => {
  const cleanParts = parts
    .filter(part => part && part !== '/')
    .map(part => part.replace(/^\/+|\/+$/g, '')) // Remove leading/trailing slashes

  return cleanParts.length > 0 ? `/${cleanParts.join('/')}` : '/'
}

/**
 * Type-safe route builder for dynamic endpoints
 */
export type RouteBuilder<T extends keyof typeof API_ROUTES> = {
  [K in keyof (typeof API_ROUTES)[T]]: (typeof API_ROUTES)[T][K]
}

/**
 * Export specific route builders for type safety
 */
export type AuthRoutes = RouteBuilder<'AUTH'>
export type CircadianRoutes = RouteBuilder<'CIRCADIAN'>
export type HealthRoutes = RouteBuilder<'HEALTH'>
export type UserRoutes = RouteBuilder<'USERS'>
export type TaskRoutes = RouteBuilder<'TASKS'>
export type ActivityRoutes = RouteBuilder<'ACTIVITIES'>
export type PlanRoutes = RouteBuilder<'PLANS'>
export type SessionRoutes = RouteBuilder<'SESSIONS'>
export type AnalyticsRoutes = RouteBuilder<'ANALYTICS'>
export type DocsRoutes = RouteBuilder<'DOCS'>
