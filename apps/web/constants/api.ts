/**
 * Centralized API Endpoints
 * Single source of truth for all API routes
 */

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
    REFRESH: '/auth/refresh',
    ME: '/users/me',
    SESSIONS: '/sessions',
    TERMINATE_SESSION: (sessionId: string) => `/sessions/${sessionId}`,
    SECURITY_LOGS: '/auth/security-logs',
    PASSWORD_RESET_REQUEST: '/auth/password-reset-request',
    PASSWORD_RESET: '/auth/password-reset',
    REGISTER: '/auth/register',
    DELETE_ACCOUNT: '/auth/delete-account',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  // User management endpoints
  USERS: {
    PROFILE: '/users/profile',
    AVATAR: '/users/avatar',
    SETTINGS: '/users/settings',
    PREFERENCES: '/users/preferences',
  },

  // Task management endpoints
  TASKS: {
    LIST: '/tasks',
    CREATE: '/tasks',
    UPDATE: (id: string) => `/tasks/${id}`,
    DELETE: (id: string) => `/tasks/${id}`,
    STATS: '/tasks/stats',
  },

  // Activity tracking endpoints
  ACTIVITIES: {
    LIST: '/activities',
    CREATE: '/activities',
    UPDATE: (id: string) => `/activities/${id}`,
    DELETE: (id: string) => `/activities/${id}`,
    TODAY: '/activities/today',
  },

  // Project management endpoints
  PROJECTS: {
    LIST: '/projects',
    CREATE: '/projects',
    UPDATE: (id: string) => `/projects/${id}`,
    DELETE: (id: string) => `/projects/${id}`,
    MEMBERS: (id: string) => `/projects/${id}/members`,
  },
} as const

/**
 * Helper function to build dynamic endpoints
 */
export const buildEndpoint = (
  base: string,
  ...parts: Array<string | number>
): string => {
  return [base, ...parts].join('/')
}

/**
 * Type-safe endpoint builder
 */
export const createEndpointBuilder = <T extends Record<string, any>>(base: string) => {
  return {
    base,
    path: (path: string) => `${base}${path}`,
    id: (id: string | number) => `${base}/${id}`,
    nested: (nested: string, id?: string | number) =>
      id ? `${base}/${id}/${nested}` : `${base}/${nested}`,
  }
}
