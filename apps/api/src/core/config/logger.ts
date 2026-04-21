export const LOGGER_CONFIG = {
  // Environment-specific settings
  development: {
    level: 'debug',
    console: true,
    file: true,
    colors: true,
    timestamp: true,
    structured: true,
    async: false, // Synchronous for debugging
  },

  production: {
    level: 'info',
    console: false,
    file: true,
    colors: false,
    timestamp: true,
    structured: true,
    async: true, // Asynchronous for performance
    compression: true,
    encryption: false, // Enable for sensitive data
  },

  test: {
    level: 'error',
    console: false,
    file: false,
    colors: false,
    timestamp: false,
    structured: true,
    async: false,
  },

  // Log rotation settings - 2025 Best Practices
  rotation: {
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    createSymlink: true,
    symlinkName: 'current.log',
    // Zero-downtime rotation
    tailable: true,
    // Compression for storage efficiency
    compress: 'gzip',
    // Encryption for sensitive logs
    encrypt: false,
  },

  // Performance thresholds - Industry standards
  performance: {
    slowRequestThreshold: 1000, // 1 second
    memoryWarningThreshold: 100 * 1024 * 1024, // 100MB
    cpuWarningThreshold: 80, // 80%
    // 2025 additions
    databaseSlowQueryThreshold: 100, // 100ms
    cacheMissThreshold: 50, // 50ms
    externalApiTimeout: 5000, // 5 seconds
  },

  // Security logging - Enhanced for 2025
  security: {
    logFailedLogins: true,
    logSuspiciousActivity: true,
    logAdminActions: true,
    maskSensitiveData: true,
    sensitiveFields: [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
      'cookie',
      'session',
      'credit_card',
      'ssn',
      'email',
    ],
    // 2025 additions
    threatDetection: true,
    anomalyDetection: true,
    rateLimitLogging: true,
    ipReputation: true,
  },

  // Request logging - Enhanced observability
  request: {
    logHeaders: true,
    logBody: false, // Set to true for debugging
    logQuery: true,
    logParams: true,
    excludePaths: ['/health', '/metrics', '/favicon.ico', '/robots.txt'],
    // 2025 additions
    correlationId: true,
    traceId: true,
    spanId: true,
    userJourney: true,
    performanceMetrics: true,
  },

  // Error logging - Enhanced debugging
  error: {
    includeStack: true,
    includeCode: true,
    maxStackDepth: 10,
    // 2025 additions
    errorGrouping: true,
    errorFingerprinting: true,
    errorTrending: true,
    autoAlerting: true,
  },

  // Database logging - Performance monitoring
  database: {
    logQueries: false, // Set to true for debugging
    logSlowQueries: true,
    slowQueryThreshold: 100, // 100ms
    // 2025 additions
    connectionPoolMetrics: true,
    transactionMetrics: true,
    deadlockDetection: true,
    queryOptimization: true,
  },

  // Compliance settings - GDPR/CCPA
  compliance: {
    gdpr: {
      enabled: true,
      dataRetention: 365, // days
      dataSubjectRights: true,
      dataPortability: true,
      dataDeletion: true,
    },
    ccpa: {
      enabled: true,
      dataRetention: 365, // days
      consumerRights: true,
      dataDisclosure: true,
    },
    audit: {
      enabled: true,
      retentionPeriod: 2555, // 7 years
      immutable: true,
      encryption: true,
    },
  },

  // Observability settings - OpenTelemetry ready
  observability: {
    traces: {
      enabled: true,
      sampling: 0.1, // 10% sampling
      propagation: true,
    },
    metrics: {
      enabled: true,
      interval: 60000, // 1 minute
      aggregation: true,
    },
    logs: {
      correlation: true,
      structured: true,
      levels: ['error', 'warn', 'info', 'debug'],
    },
  },

  // Monitoring and alerting
  monitoring: {
    healthChecks: true,
    performanceMonitoring: true,
    errorTracking: true,
    // 2025 additions
    predictiveAnalytics: true,
    anomalyDetection: true,
    capacityPlanning: true,
    costOptimization: true,
  },
} as const

// Utility functions for 2025 best practices
export const getLoggerConfig = (
  environment: string = process.env.NODE_ENV || 'development',
) => {
  return (
    LOGGER_CONFIG[environment as keyof typeof LOGGER_CONFIG] ||
    LOGGER_CONFIG.development
  )
}

export const shouldLogRequest = (path: string): boolean => {
  return !LOGGER_CONFIG.request.excludePaths.some(excludePath =>
    path.startsWith(excludePath),
  )
}

export const maskSensitiveData = (data: any): any => {
  if (!LOGGER_CONFIG.security.maskSensitiveData) return data

  const sensitiveFields = LOGGER_CONFIG.security.sensitiveFields

  if (typeof data === 'object' && data !== null) {
    const masked = { ...data }
    for (const field of sensitiveFields) {
      if (masked[field]) {
        masked[field] = '***MASKED***'
      }
    }
    return masked
  }

  return data
}

// GDPR/CCPA compliance utilities
export const isCompliantLogging = (): boolean => {
  return LOGGER_CONFIG.compliance.gdpr.enabled || LOGGER_CONFIG.compliance.ccpa.enabled
}

export const getDataRetentionPeriod = (): number => {
  return Math.max(
    LOGGER_CONFIG.compliance.gdpr.dataRetention,
    LOGGER_CONFIG.compliance.ccpa.dataRetention,
  )
}

// Performance monitoring utilities
export const shouldLogPerformance = (duration: number): boolean => {
  return duration > LOGGER_CONFIG.performance.slowRequestThreshold
}

export const shouldLogMemoryWarning = (memoryUsage: NodeJS.MemoryUsage): boolean => {
  return memoryUsage.rss > LOGGER_CONFIG.performance.memoryWarningThreshold
}

// Security utilities
export const getSecurityLevel = (
  event: string,
): 'low' | 'medium' | 'high' | 'critical' => {
  const criticalEvents = ['login_failed', 'unauthorized_access', 'data_breach']
  const highEvents = ['suspicious_activity', 'rate_limit_exceeded']
  const mediumEvents = ['admin_action', 'password_change']

  if (criticalEvents.includes(event)) return 'critical'
  if (highEvents.includes(event)) return 'high'
  if (mediumEvents.includes(event)) return 'medium'
  return 'low'
}

// Observability utilities
export const generateCorrelationId = (): string => {
  return `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const generateTraceId = (): string => {
  return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const generateSpanId = (): string => {
  return `span-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
