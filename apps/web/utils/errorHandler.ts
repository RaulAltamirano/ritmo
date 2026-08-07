/**
 * 🚀 RITMO ERROR HANDLING SYSTEM - 2025 BEST PRACTICES
 *
 * Standardized error handling for the frontend that maps
 * backend error codes to user-friendly messages
 */

import { ErrorCode, type ApiResponse, type ErrorDetail } from '@/types/api.d'

// User-friendly error messages in Spanish and English
export const ERROR_MESSAGES = {
  // Authentication & Authorization
  [ErrorCode.UNAUTHORIZED]: {
    es: 'Debes iniciar sesión para continuar',
    en: 'You must be logged in to continue',
  },
  [ErrorCode.FORBIDDEN]: {
    es: 'No tienes permisos para realizar esta acción',
    en: 'You do not have permission to perform this action',
  },
  [ErrorCode.INVALID_TOKEN]: {
    es: 'Tu sesión ha expirado, por favor inicia sesión nuevamente',
    en: 'Your session has expired, please log in again',
  },
  [ErrorCode.TOKEN_EXPIRED]: {
    es: 'Tu sesión ha expirado, por favor inicia sesión nuevamente',
    en: 'Your session has expired, please log in again',
  },
  [ErrorCode.TOKEN_REFRESH_FAILED]: {
    es: 'Error al renovar tu sesión, por favor inicia sesión nuevamente',
    en: 'Failed to refresh your session, please log in again',
  },
  [ErrorCode.TOKEN_ROTATION_FAILED]: {
    es: 'Error de seguridad en tu sesión, por favor inicia sesión nuevamente',
    en: 'Security error in your session, please log in again',
  },
  [ErrorCode.TOKEN_REUSE_DETECTED]: {
    es: 'Se detectó un uso no autorizado de tu sesión, por seguridad se cerró',
    en: 'Unauthorized session usage detected, session closed for security',
  },
  [ErrorCode.NO_TOKEN_PROVIDED]: {
    es: 'No se proporcionó token de autenticación',
    en: 'No authentication token provided',
  },
  [ErrorCode.INVALID_TOKEN_TYPE]: {
    es: 'Tipo de token inválido',
    en: 'Invalid token type',
  },

  // Validation
  [ErrorCode.VALIDATION_ERROR]: {
    es: 'Los datos ingresados no son válidos',
    en: 'The entered data is not valid',
  },
  [ErrorCode.INVALID_INPUT]: {
    es: 'Entrada inválida',
    en: 'Invalid input',
  },
  [ErrorCode.MISSING_REQUIRED_FIELD]: {
    es: 'Faltan campos requeridos',
    en: 'Required fields are missing',
  },

  // Resource Management
  [ErrorCode.NOT_FOUND]: {
    es: 'El recurso solicitado no fue encontrado',
    en: 'The requested resource was not found',
  },
  [ErrorCode.DUPLICATE_ENTRY]: {
    es: 'Ya existe un registro con esta información',
    en: 'A record with this information already exists',
  },
  [ErrorCode.RESOURCE_CONFLICT]: {
    es: 'Conflicto con el recurso solicitado',
    en: 'Conflict with the requested resource',
  },
  [ErrorCode.TASK_NOT_FOUND]: {
    es: 'La tarea solicitada no fue encontrada',
    en: 'The requested task was not found',
  },
  [ErrorCode.ACTIVITY_NOT_FOUND]: {
    es: 'La actividad solicitada no fue encontrada',
    en: 'The requested activity was not found',
  },
  [ErrorCode.SESSION_NOT_FOUND]: {
    es: 'La sesión solicitada no fue encontrada',
    en: 'The requested session was not found',
  },

  // Business Logic
  [ErrorCode.BUSINESS_RULE_VIOLATION]: {
    es: 'La operación viola una regla de negocio',
    en: 'The operation violates a business rule',
  },
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: {
    es: 'Permisos insuficientes para realizar esta acción',
    en: 'Insufficient permissions to perform this action',
  },
  [ErrorCode.MAX_SESSIONS_LIMIT_REACHED]: {
    es: 'Has alcanzado el límite máximo de sesiones activas',
    en: 'You have reached the maximum limit of active sessions',
  },
  [ErrorCode.SESSION_ALREADY_EXISTS]: {
    es: 'Ya existe una sesión para este dispositivo',
    en: 'A session already exists for this device',
  },

  // User Management
  [ErrorCode.USER_ALREADY_EXISTS]: {
    es: 'Ya existe un usuario con este email o nombre de usuario',
    en: 'A user with this email or username already exists',
  },
  [ErrorCode.ACCOUNT_LOCKED]: {
    es: 'Tu cuenta está temporalmente bloqueada por múltiples intentos fallidos',
    en: 'Your account is temporarily locked due to multiple failed attempts',
  },
  [ErrorCode.ACCOUNT_DISABLED]: {
    es: 'Tu cuenta está deshabilitada',
    en: 'Your account is disabled',
  },
  [ErrorCode.INVALID_CREDENTIALS]: {
    es: 'Email o contraseña incorrectos',
    en: 'Incorrect email or password',
  },
  [ErrorCode.INVALID_OR_EXPIRED_TOKEN]: {
    es: 'El token de restablecimiento es inválido o ha expirado',
    en: 'The reset token is invalid or has expired',
  },

  // System Errors
  [ErrorCode.INTERNAL_ERROR]: {
    es: 'Error interno del servidor, por favor intenta más tarde',
    en: 'Internal server error, please try again later',
  },
  [ErrorCode.SERVICE_UNAVAILABLE]: {
    es: 'El servicio no está disponible en este momento',
    en: 'The service is not available at this time',
  },
  [ErrorCode.RATE_LIMIT_EXCEEDED]: {
    es: 'Has excedido el límite de solicitudes, por favor espera un momento',
    en: 'You have exceeded the request limit, please wait a moment',
  },
  [ErrorCode.AUTHENTICATION_FAILED]: {
    es: 'La autenticación falló',
    en: 'Authentication failed',
  },
  [ErrorCode.REGISTRATION_FAILED]: {
    es: 'El registro falló',
    en: 'Registration failed',
  },
  [ErrorCode.LOGIN_FAILED]: {
    es: 'El inicio de sesión falló',
    en: 'Login failed',
  },
  [ErrorCode.LOGOUT_FAILED]: {
    es: 'El cierre de sesión falló',
    en: 'Logout failed',
  },
  [ErrorCode.LOGOUT_ALL_FAILED]: {
    es: 'El cierre de todas las sesiones falló',
    en: 'Logout from all devices failed',
  },

  // Security
  [ErrorCode.SECURITY_VIOLATION]: {
    es: 'Se detectó una violación de seguridad',
    en: 'A security violation was detected',
  },
  [ErrorCode.DEVICE_VALIDATION_FAILED]: {
    es: 'La validación del dispositivo falló',
    en: 'Device validation failed',
  },

  // Default error message
  DEFAULT: {
    es: 'Ha ocurrido un error inesperado',
    en: 'An unexpected error has occurred',
  },
} as const

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error severity mapping
export const ERROR_SEVERITY: Record<ErrorCode | string, ErrorSeverity> = {
  // Critical - Security issues
  [ErrorCode.SECURITY_VIOLATION]: ErrorSeverity.CRITICAL,
  [ErrorCode.TOKEN_REUSE_DETECTED]: ErrorSeverity.CRITICAL,
  [ErrorCode.DEVICE_VALIDATION_FAILED]: ErrorSeverity.CRITICAL,

  // High - Authentication issues
  [ErrorCode.UNAUTHORIZED]: ErrorSeverity.HIGH,
  [ErrorCode.FORBIDDEN]: ErrorSeverity.HIGH,
  [ErrorCode.INVALID_TOKEN]: ErrorSeverity.HIGH,
  [ErrorCode.TOKEN_EXPIRED]: ErrorSeverity.HIGH,
  [ErrorCode.ACCOUNT_LOCKED]: ErrorSeverity.HIGH,
  [ErrorCode.ACCOUNT_DISABLED]: ErrorSeverity.HIGH,

  // Medium - Business logic issues
  [ErrorCode.VALIDATION_ERROR]: ErrorSeverity.MEDIUM,
  [ErrorCode.BUSINESS_RULE_VIOLATION]: ErrorSeverity.MEDIUM,
  [ErrorCode.RESOURCE_CONFLICT]: ErrorSeverity.MEDIUM,
  [ErrorCode.DUPLICATE_ENTRY]: ErrorSeverity.MEDIUM,
  [ErrorCode.MAX_SESSIONS_LIMIT_REACHED]: ErrorSeverity.MEDIUM,

  // Low - General issues
  [ErrorCode.NOT_FOUND]: ErrorSeverity.LOW,
  [ErrorCode.INTERNAL_ERROR]: ErrorSeverity.LOW,
  [ErrorCode.SERVICE_UNAVAILABLE]: ErrorSeverity.LOW,
  [ErrorCode.RATE_LIMIT_EXCEEDED]: ErrorSeverity.LOW,

  // Default
  DEFAULT: ErrorSeverity.MEDIUM,
}

// Error handling configuration
export interface ErrorHandlerConfig {
  language?: 'es' | 'en'
  showTechnicalDetails?: boolean
  logErrors?: boolean
  showNotifications?: boolean
}

// Enhanced error object
export interface EnhancedError extends Error {
  code?: string
  details?: ErrorDetail[]
  requestId?: string
  severity?: ErrorSeverity
  userMessage?: string
  technicalMessage?: string
  timestamp?: string
  path?: string
  method?: string
  duration?: number
}

/**
 * Get user-friendly error message
 */
export const getUserErrorMessage = (
  errorCode: string,
  language: 'es' | 'en' = 'es',
): string => {
  const errorMessage = ERROR_MESSAGES[errorCode as ErrorCode]
  if (errorMessage) {
    return errorMessage[language]
  }
  return ERROR_MESSAGES.DEFAULT[language]
}

/**
 * Get error severity
 */
export const getErrorSeverity = (errorCode: string): ErrorSeverity => {
  return ERROR_SEVERITY[errorCode as ErrorCode] || ERROR_SEVERITY.DEFAULT
}

/**
 * Create enhanced error from API response
 */
export const createEnhancedError = (
  apiResponse: ApiResponse,
  language: 'es' | 'en' = 'es',
): EnhancedError => {
  const errorCode = apiResponse.error?.code ?? 'UNKNOWN_ERROR'
  const userMessage = getUserErrorMessage(errorCode, language)
  const severity = getErrorSeverity(errorCode)

  const enhancedError = new Error(userMessage) as EnhancedError
  enhancedError.code = errorCode
  enhancedError.details = apiResponse.error?.details
  enhancedError.requestId = apiResponse.meta?.requestId
  enhancedError.severity = severity
  enhancedError.userMessage = userMessage
  enhancedError.technicalMessage = apiResponse.error?.message
  enhancedError.timestamp = apiResponse.meta?.timestamp
  enhancedError.path = apiResponse.meta?.path
  enhancedError.method = apiResponse.meta?.method
  enhancedError.duration = apiResponse.meta?.duration

  return enhancedError
}

/**
 * Handle API error response
 */
export const handleApiError = (
  apiResponse: ApiResponse,
  config: ErrorHandlerConfig = {},
): EnhancedError => {
  const { language = 'es', logErrors = true, showTechnicalDetails = false } = config

  const enhancedError = createEnhancedError(apiResponse, language)

  // Log error if enabled
  if (logErrors) {
    console.error('🚨 API Error:', {
      code: enhancedError.code,
      userMessage: enhancedError.userMessage,
      technicalMessage: enhancedError.technicalMessage,
      requestId: enhancedError.requestId,
      severity: enhancedError.severity,
      path: enhancedError.path,
      method: enhancedError.method,
      duration: enhancedError.duration,
      details: enhancedError.details,
    })
  }

  // Show technical details in development
  if (showTechnicalDetails && process.env.NODE_ENV === 'development') {
    console.group('🔍 Technical Error Details')
    // Request details logged for debugging
    console.groupEnd()
  }

  return enhancedError
}

/**
 * Handle generic error (non-API)
 */
export const handleGenericError = (
  error: any,
  config: ErrorHandlerConfig = {},
): EnhancedError => {
  const { language = 'es', logErrors = true } = config

  // If it's already an enhanced error, return it
  if (error.code && error.severity) {
    return error as EnhancedError
  }

  // Create enhanced error from generic error
  const enhancedError = new Error(error.message ?? 'Unknown error') as EnhancedError
  enhancedError.code = 'UNKNOWN_ERROR'
  enhancedError.severity = ErrorSeverity.MEDIUM
  enhancedError.userMessage = getUserErrorMessage('DEFAULT', language)
  enhancedError.technicalMessage = error.message
  enhancedError.timestamp = new Date().toISOString()

  if (error?.status != null) (enhancedError as any).status = error.status
  if (error?.statusCode != null) (enhancedError as any).statusCode = error.statusCode
  if (error?.data != null) (enhancedError as any).data = error.data
  const apiCode = error?.data?.error?.code ?? error?.code
  if (typeof apiCode === 'string') enhancedError.code = apiCode

  // Log error if enabled
  if (logErrors) {
    console.error('❌ Generic Error:', {
      message: error.message,
      stack: error.stack,
      userMessage: enhancedError.userMessage,
    })
  }

  return enhancedError
}

/**
 * Get error icon based on severity
 */
export const getErrorIcon = (severity: ErrorSeverity): string => {
  switch (severity) {
    case ErrorSeverity.CRITICAL:
      return '🚨'
    case ErrorSeverity.HIGH:
      return '⚠️'
    case ErrorSeverity.MEDIUM:
      return '❗'
    case ErrorSeverity.LOW:
      return 'ℹ️'
    default:
      return '❌'
  }
}

/**
 * Get error color based on severity
 */
export const getErrorColor = (severity: ErrorSeverity): string => {
  switch (severity) {
    case ErrorSeverity.CRITICAL:
      return 'text-red-600 dark:text-red-400'
    case ErrorSeverity.HIGH:
      return 'text-orange-600 dark:text-orange-400'
    case ErrorSeverity.MEDIUM:
      return 'text-yellow-600 dark:text-yellow-400'
    case ErrorSeverity.LOW:
      return 'text-blue-600 dark:text-blue-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

/**
 * Get error background color based on severity
 */
export const getErrorBackgroundColor = (severity: ErrorSeverity): string => {
  switch (severity) {
    case ErrorSeverity.CRITICAL:
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    case ErrorSeverity.HIGH:
      return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
    case ErrorSeverity.MEDIUM:
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    case ErrorSeverity.LOW:
      return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    default:
      return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
  }
}

/**
 * Format error details for display
 */
export const formatErrorDetails = (
  details: ErrorDetail[],
  _language: 'es' | 'en' = 'es',
): string[] => {
  return details.map(detail => {
    if (detail.field) {
      const fieldName = detail.field.charAt(0).toUpperCase() + detail.field.slice(1)
      return `${fieldName}: ${detail.message}`
    }
    return detail.message
  })
}

/**
 * Check if error is retryable
 */
export const isRetryableError = (errorCode: string): boolean => {
  const nonRetryableCodes = [
    ErrorCode.UNAUTHORIZED,
    ErrorCode.FORBIDDEN,
    ErrorCode.INVALID_TOKEN,
    ErrorCode.TOKEN_EXPIRED,
    ErrorCode.ACCOUNT_LOCKED,
    ErrorCode.ACCOUNT_DISABLED,
    ErrorCode.VALIDATION_ERROR,
    ErrorCode.BUSINESS_RULE_VIOLATION,
    ErrorCode.NOT_FOUND,
    ErrorCode.DUPLICATE_ENTRY,
  ]

  return !nonRetryableCodes.includes(errorCode as ErrorCode)
}

/**
 * Get retry delay based on error
 */
export const getRetryDelay = (errorCode: string, attempt: number): number => {
  // Don't retry non-retryable errors
  if (!isRetryableError(errorCode)) {
    return 0
  }

  // Don't retry too many times
  if (attempt > 3) {
    return 0
  }

  // Exponential backoff: 1s, 2s, 4s
  const baseDelay = 1000
  const maxDelay = 8000 // Reduced from 30s to 8s
  const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay)

  // Add jitter to prevent thundering herd (reduced from 1000ms to 500ms)
  const jitter = Math.random() * 500
  return delay + jitter
}
