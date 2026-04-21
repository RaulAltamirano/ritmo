/**
 * 🚨 CUSTOM EXCEPTIONS - RITMO API 2025
 *
 * Excepciones personalizadas para manejo de errores consistente
 * Siguiendo patrones de Clean Architecture
 */

import type { IAppException } from './base.interface.ts'

// ========================================
// BASE APPLICATION EXCEPTION
// ========================================

export abstract class AppException extends Error implements IAppException {
  public readonly code: string
  public readonly statusCode: number
  public readonly details?: any
  public readonly timestamp: Date

  constructor(message: string, code: string, statusCode = 500, details?: any) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.timestamp = new Date()
  }

  public toJSON(): IAppException {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
    }
  }
}

// ========================================
// VALIDATION EXCEPTIONS
// ========================================

export class ValidationException extends AppException {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details)
  }
}

export class InvalidInputException extends AppException {
  constructor(message: string, details?: any) {
    super(message, 'INVALID_INPUT', 400, details)
  }
}

// ========================================
// AUTHENTICATION EXCEPTIONS
// ========================================

export class AuthenticationException extends AppException {
  constructor(message = 'Authentication failed', details?: any) {
    super(message, 'AUTHENTICATION_ERROR', 401, details)
  }
}

export class AuthorizationException extends AppException {
  constructor(message = 'Access denied', details?: any) {
    super(message, 'AUTHORIZATION_ERROR', 403, details)
  }
}

export class TokenExpiredException extends AppException {
  constructor(message = 'Token has expired', details?: any) {
    super(message, 'TOKEN_EXPIRED', 401, details)
  }
}

export class InvalidTokenException extends AppException {
  constructor(message = 'Invalid token', details?: any) {
    super(message, 'INVALID_TOKEN', 401, details)
  }
}

// ========================================
// RESOURCE EXCEPTIONS
// ========================================

export class ResourceNotFoundException extends AppException {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`
    super(message, 'RESOURCE_NOT_FOUND', 404)
  }
}

export class ResourceAlreadyExistsException extends AppException {
  constructor(resource: string, details?: any) {
    super(`${resource} already exists`, 'RESOURCE_EXISTS', 409, details)
  }
}

export class ResourceConflictException extends AppException {
  constructor(message: string, details?: any) {
    super(message, 'RESOURCE_CONFLICT', 409, details)
  }
}

// ========================================
// BUSINESS LOGIC EXCEPTIONS
// ========================================

export class BusinessRuleException extends AppException {
  constructor(message: string, details?: any) {
    super(message, 'BUSINESS_RULE_VIOLATION', 422, details)
  }
}

export class InsufficientPermissionsException extends AppException {
  constructor(message = 'Insufficient permissions', details?: any) {
    super(message, 'INSUFFICIENT_PERMISSIONS', 403, details)
  }
}

export class RateLimitException extends AppException {
  constructor(message = 'Rate limit exceeded', details?: any) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, details)
  }
}

// ========================================
// INFRASTRUCTURE EXCEPTIONS
// ========================================

export class DatabaseException extends AppException {
  constructor(message: string, details?: any) {
    super(message, 'DATABASE_ERROR', 500, details)
  }
}

export class ExternalServiceException extends AppException {
  constructor(service: string, message: string, details?: any) {
    super(`${service}: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502, details)
  }
}

export class CacheException extends AppException {
  constructor(message: string, details?: any) {
    super(message, 'CACHE_ERROR', 500, details)
  }
}

export class ConfigurationException extends AppException {
  constructor(message: string, details?: any) {
    super(message, 'CONFIGURATION_ERROR', 500, details)
  }
}

// ========================================
// SECURITY EXCEPTIONS
// ========================================

export class SecurityException extends AppException {
  constructor(message: string, details?: any) {
    super(message, 'SECURITY_ERROR', 403, details)
  }
}

export class SuspiciousActivityException extends AppException {
  constructor(message: string, details?: any) {
    super(message, 'SUSPICIOUS_ACTIVITY', 403, details)
  }
}

export class AccountLockedException extends AppException {
  constructor(message = 'Account is temporarily locked', details?: any) {
    super(message, 'ACCOUNT_LOCKED', 423, details)
  }
}

// ========================================
// CIRCADIAN SPECIFIC EXCEPTIONS
// ========================================

export class CircadianPhaseException extends AppException {
  constructor(message: string, details?: any) {
    super(message, 'CIRCADIAN_PHASE_ERROR', 400, details)
  }
}

export class InvalidPhaseException extends AppException {
  constructor(phase: string, details?: any) {
    super(`Invalid circadian phase: ${phase}`, 'INVALID_PHASE', 400, details)
  }
}

export class SessionConflictException extends AppException {
  constructor(message: string, details?: any) {
    super(message, 'SESSION_CONFLICT', 409, details)
  }
}

// ========================================
// EXCEPTION FACTORY
// ========================================

export class ExceptionFactory {
  static createValidationError(message: string, details?: any): ValidationException {
    return new ValidationException(message, details)
  }

  static createNotFoundError(resource: string, id?: string): ResourceNotFoundException {
    return new ResourceNotFoundException(resource, id)
  }

  static createAuthError(message?: string, details?: any): AuthenticationException {
    return new AuthenticationException(message, details)
  }

  static createAuthzError(message?: string, details?: any): AuthorizationException {
    return new AuthorizationException(message, details)
  }

  static createBusinessError(message: string, details?: any): BusinessRuleException {
    return new BusinessRuleException(message, details)
  }

  static createDatabaseError(message: string, details?: any): DatabaseException {
    return new DatabaseException(message, details)
  }

  static createSecurityError(message: string, details?: any): SecurityException {
    return new SecurityException(message, details)
  }
}

// ========================================
// EXCEPTION HANDLER UTILITIES
// ========================================

export class ExceptionHandler {
  static isAppException(error: any): error is AppException {
    return error instanceof AppException
  }

  static getStatusCode(error: any): number {
    if (this.isAppException(error)) {
      return error.statusCode
    }
    return 500
  }

  static getErrorCode(error: any): string {
    if (this.isAppException(error)) {
      return error.code
    }
    return 'INTERNAL_SERVER_ERROR'
  }

  static formatError(error: any): IAppException {
    if (this.isAppException(error)) {
      return error.toJSON()
    }

    return {
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message || 'An unexpected error occurred',
      statusCode: 500,
      timestamp: new Date(),
    }
  }

  static logError(error: any, context?: any): void {
    const errorInfo = this.formatError(error)
    console.error('🚨 Application Error:', {
      ...errorInfo,
      context,
      stack: error.stack,
    })
  }
}
