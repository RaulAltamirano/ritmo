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

  // Task management endpoints (replaces ACTIVITIES)
  TASKS: {
    LIST: '/tasks',
    TODAY: '/tasks/today',
    CREATE: '/tasks',
    UPDATE: (id: string) => `/tasks/${id}`,
    DELETE: (id: string) => `/tasks/${id}`,
  },

  // Plan management endpoints (goal containers; UI route /planes)
  PLANS: {
    LIST: '/plans',
    CREATE: '/plans',
    BY_ID: (id: string) => `/plans/${id}`,
    UPDATE: (id: string) => `/plans/${id}`,
    DELETE: (id: string) => `/plans/${id}`,
    TASKS: (id: string) => `/plans/${id}/tasks`,
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
export const createEndpointBuilder = (base: string) => {
  return {
    base,
    path: (path: string) => `${base}${path}`,
    id: (id: string | number) => `${base}/${id}`,
    nested: (nested: string, id?: string | number) =>
      id ? `${base}/${id}/${nested}` : `${base}/${nested}`,
  }
}
