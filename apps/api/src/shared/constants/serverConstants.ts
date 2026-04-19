/**
 * RITMO SERVER CONSTANTS
 *
 * Centralized constants for easy maintenance and configuration
 * Updated with modern 2025 routing patterns
 */

export const SERVER_CONSTANTS = {
  // Visual Configuration
  SEPARATOR_LENGTH: 60,
  SEPARATOR_CHAR: '=',

  ENDPOINTS: {
    API_BASE: '/api',

    HEALTH: '/health',
    HEALTH_STATUS: '/health/status',
    HEALTH_AUTH: '/health/auth-status',
    HEALTH_CONFIG: '/health/config-health',

    AUTH: '/api/auth',
    AUTH_LOGIN: '/api/auth/login',
    AUTH_REGISTER: '/api/auth/register',
    AUTH_REFRESH: '/api/auth/refresh',
    AUTH_LOGOUT: '/api/auth/logout',
    AUTH_ME: '/api/users/me',

    CIRCADIAN: '/api/circadian',
    CIRCADIAN_PHASES: '/api/circadian/phases',
    CIRCADIAN_CATEGORIES: '/api/circadian/categories',

    DOCS: '/api/docs',
    OPENAPI: '/api/docs/openapi',
    SWAGGER: '/api/docs/swagger',
  },

  // Request Limits
  LIMITS: {
    JSON_SIZE: '10mb',
    URL_ENCODED: true,
    RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: 100,
  },

  // CORS Headers
  CORS_HEADERS: {
    ALLOWED: [
      'Content-Type',
      'X-Requested-With',
      'X-Request-ID',
      'Authorization',
      'Origin',
      'Accept',
      'Cache-Control',
      'X-File-Name',
      // Device fingerprinting headers
      'X-Device-Id',
      'X-Device-Type',
      'X-Device-Browser',
      'X-Device-OS',
    ],
    EXPOSED: ['Set-Cookie', 'X-Request-ID'],
  },

  // CORS Methods
  CORS_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  // Security Headers
  SECURITY: {
    CSP_DIRECTIVES: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
    CROSS_ORIGIN_EMBEDDER: false,
  },

  // Logging
  LOGGING: {
    SHOW_TIMESTAMPS: true,
    SHOW_COLORS: true,
    REQUEST_LOG_FORMAT:
      '[REQ] [{timestamp}] {method} {path} | Origin: {origin} | UA: {userAgent}',
  },
} as const

export const MESSAGES = {
  SERVER: {
    INIT: 'RITMO API SERVER - INITIALIZATION',
    READY: 'RITMO API SERVER READY!',
    STARTING: 'Starting RITMO API Server...',
    CONFIGURED: 'Server configured successfully',
    MIDDLEWARE_INIT: 'Middleware stack initialized',
    ROUTES_REGISTERED: 'Routes registered with modern 2025 patterns',
    ERROR_HANDLERS_CONFIGURED: 'Error handlers configured',
  },

  DATABASE: {
    CONNECTING: 'Connecting to database...',
    CONNECTED: 'Database connected successfully',
    HEALTH_CHECK_PASSED: 'Database health check passed',
    DISCONNECTED: 'Database disconnected successfully',
  },

  STATUS: {
    RUNNING: 'Server running successfully',
    CONNECTED: 'Database connected',
    SECURITY_CONFIGURED: 'Security configured',
    READY: 'Ready to handle requests',
    ROUTING_MODERNIZED: 'Modern routing system active',
  },

  SHUTDOWN: {
    INITIATED: 'SHUTDOWN INITIATED',
    SIGNAL_RECEIVED: 'Signal received: {signal}',
    DISCONNECTING_DB: 'Disconnecting database...',
    COMPLETE: 'Server shutdown complete',
  },

  ERROR: {
    STARTUP_FAILED: 'FAILED TO START SERVER',
    SERVER_STARTUP_FAILED: 'Server startup failed',
    DETAILS: 'Details: {error}',
    TROUBLESHOOTING: 'TROUBLESHOOTING:',
    TROUBLESHOOTING_ITEMS: [
      'Check database connection',
      'Verify environment variables',
      'Check port availability',
      'Review error logs above',
    ],
  },

  INFO: {
    PRESS_CTRL_C: 'Press Ctrl+C to stop the server',
    MODERN_ROUTING: 'Modern routing system initialized - no more double slashes!',
  },
} as const

export const URL_TEMPLATES = {
  LOCALHOST: 'http://localhost:{port}',
  SERVER: 'http://localhost:{port}',
  API: 'http://localhost:{port}/api',
  HEALTH: 'http://localhost:{port}/api/health',
  DOCS: 'http://localhost:{port}/api/docs',
} as const
