/**
 * ✅ VALIDATION SYSTEM - RITMO API 2025
 *
 * Sistema moderno de validación usando esquemas compartidos del monorepo
 * Siguiendo patrones de Clean Architecture
 */

import {
  authValidationSchemas,
  validateData,
  type ChangePassword,
  type EmailVerification,
  type LoginCredentials,
  type PasswordReset,
  type PasswordResetRequest,
  type ProfileUpdate,
  type RegisterCredentials,
  type ResendVerification,
} from '@ritmo/shared'
import { z } from 'zod'
import { timerPresetsSchema } from '../../modules/users/timerPresets.dto.js'
import { ValidationException } from '../../shared/exceptions/app.exceptions.js'
import { IValidator } from '../../shared/interfaces/base.interface.js'

// ========================================
// BASE VALIDATOR CLASS
// ========================================

export abstract class BaseValidator<T> implements IValidator<T> {
  protected schema: z.ZodSchema<T>

  constructor(schema: z.ZodSchema<T>) {
    this.schema = schema
  }

  validate(data: any): { isValid: boolean; errors: string[] } {
    const result = validateData(this.schema, data)
    return {
      isValid: result.success,
      errors: result.success ? [] : Object.values(result.errors),
    }
  }

  sanitize(data: any): T {
    const result = validateData(this.schema, data)
    if (!result.success) {
      throw new ValidationException('Validation failed', Object.values(result.errors))
    }
    return result.data
  }

  safeParse(data: any): z.SafeParseReturnType<any, T> {
    return this.schema.safeParse(data)
  }
}

// ========================================
// AUTH VALIDATOR USING SHARED SCHEMAS
// ========================================

export class AuthValidator {
  // Use shared schemas from @ritmo/shared
  static readonly registerSchema = authValidationSchemas.register
  static readonly loginSchema = authValidationSchemas.login
  static readonly passwordResetRequestSchema =
    authValidationSchemas.passwordResetRequest
  static readonly passwordResetSchema = authValidationSchemas.passwordReset
  static readonly profileUpdateSchema = authValidationSchemas.profileUpdate
  static readonly changePasswordSchema = authValidationSchemas.changePassword
  static readonly emailVerificationSchema = authValidationSchemas.emailVerification
  static readonly resendVerificationSchema = authValidationSchemas.resendVerification

  // Refresh token (API specific) - Optional since we read from cookies
  static readonly refreshTokenSchema = z.object({
    refreshToken: z.string().optional(), // Optional since we read from cookies
  })

  // Additional schemas for auth routes
  static readonly refreshSchema = z.object({
    refreshToken: z.string().optional(),
  })

  static readonly logoutSchema = z.object({
    refreshToken: z.string().optional(),
  })

  static readonly forgotPasswordSchema = authValidationSchemas.passwordResetRequest
  static readonly resetPasswordSchema = authValidationSchemas.passwordReset
  static readonly securityAuditSchema = z.object({
    userId: z.string().optional(),
  })
  static readonly verifyEmailSchema = authValidationSchemas.emailVerification
}

// ========================================
// CIRCADIAN VALIDATION SCHEMAS
// ========================================

export class CircadianValidator {
  // Phase preferences
  static readonly preferencesSchema = z.object({
    preferredPhases: z
      .array(
        z.enum([
          'SLOW_ACTIVATION',
          'MORNING_FOCUS_PEAK',
          'COGNITIVE_PEAK',
          'SECOND_PRODUCTIVITY',
          'CREATIVE_WINDOW',
          'TRANSITION',
          'INTROSPECTIVE',
          'SLEEP_PREPARATION',
        ]),
      )
      .optional(),
    customHours: z
      .object({
        startHour: z.number().min(0).max(23),
        endHour: z.number().min(0).max(23),
      })
      .optional(),
    notificationPreferences: z
      .object({
        enabled: z.boolean(),
        types: z.array(z.enum(['push', 'email', 'both', 'none'])),
        advanceWarning: z.number().min(5).max(60),
      })
      .optional(),
    taskPreferences: z.record(z.string(), z.number().min(1).max(10)).optional(),
  })

  // Session recording
  static readonly sessionSchema = z.object({
    phaseType: z.enum([
      'SLOW_ACTIVATION',
      'MORNING_FOCUS_PEAK',
      'COGNITIVE_PEAK',
      'SECOND_PRODUCTIVITY',
      'CREATIVE_WINDOW',
      'TRANSITION',
      'INTROSPECTIVE',
      'SLEEP_PREPARATION',
    ]),
    startTime: z.string().datetime(),
    endTime: z.string().datetime().optional(),
    taskType: z.string().min(1),
    productivityScore: z.number().min(1).max(10).optional(),
    focusScore: z.number().min(1).max(10).optional(),
    energyLevel: z.number().min(1).max(10).optional(),
    notes: z.string().max(500).optional(),
  })

  // Analytics query
  static readonly analyticsQuerySchema = z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    phaseType: z
      .enum([
        'SLOW_ACTIVATION',
        'MORNING_FOCUS_PEAK',
        'COGNITIVE_PEAK',
        'SECOND_PRODUCTIVITY',
        'CREATIVE_WINDOW',
        'TRANSITION',
        'INTROSPECTIVE',
        'SLEEP_PREPARATION',
      ])
      .optional(),
    groupBy: z.enum(['day', 'week', 'month']).default('week'),
  })
}

// ========================================
// USER VALIDATION SCHEMAS
// ========================================

export class UserValidator {
  // User preferences schema
  static readonly preferencesSchema = z.object({
    timezone: z.string().optional(),
    language: z.string().optional(),
    timerPresets: timerPresetsSchema.optional(),
    notifications: z
      .object({
        email: z.boolean().optional(),
        push: z.boolean().optional(),
        sms: z.boolean().optional(),
      })
      .optional(),
    privacy: z
      .object({
        profileVisibility: z.enum(['public', 'private', 'friends']).optional(),
        showEmail: z.boolean().optional(),
        showLastSeen: z.boolean().optional(),
      })
      .optional(),
    theme: z.enum(['light', 'dark', 'auto']).optional(),
  })
  // Profile update using shared schema
  static readonly profileUpdateSchema = authValidationSchemas.profileUpdate

  // Theme update schema (specific endpoint)
  static readonly themeUpdateSchema = z.object({
    theme: z.enum(['light', 'dark', 'system'], {
      required_error: 'Theme is required',
      invalid_type_error: 'Theme must be light, dark, or system',
    }),
  })

  // User search
  static readonly userSearchSchema = z.object({
    query: z.string().min(1, 'Search query is required'),
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
  })
}

// ========================================
// COMMON VALIDATION SCHEMAS
// ========================================

export class CommonValidator {
  // Pagination
  static readonly paginationSchema = z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
  })
}

// ========================================
// VALIDATION DECORATORS
// ========================================

export function Validate(schema: z.ZodSchema<any>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      const req = args[0]
      const res = args[1]

      const result = validateData(schema, req.body)
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: Object.entries(result.errors).map(([field, message]) => ({
              field,
              message,
              value: req.body[field],
            })),
          },
          meta: {
            timestamp: new Date().toISOString(),
            path: req.path,
            method: req.method,
            requestId: req.requestId,
          },
        })
      }

      req.validatedBody = result.data
      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

export function ValidateQuery(schema: z.ZodSchema<any>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      const req = args[0]
      const res = args[1]

      const result = validateData(schema, req.query)
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Query validation failed',
            details: Object.entries(result.errors).map(([field, message]) => ({
              field,
              message,
              value: req.query[field],
            })),
          },
          meta: {
            timestamp: new Date().toISOString(),
            path: req.path,
            method: req.method,
            requestId: req.requestId,
          },
        })
      }

      req.validatedQuery = result.data
      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

// ========================================
// VALIDATION MIDDLEWARE
// ========================================

export class ValidationMiddleware {
  static validateBody(schema: z.ZodSchema<any>) {
    return (req: any, res: any, next: any) => {
      const result = validateData(schema, req.body)
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request body validation failed',
            details: Object.entries(result.errors).map(([field, message]) => ({
              field,
              message,
              value: req.body[field],
            })),
          },
          meta: {
            timestamp: new Date().toISOString(),
            path: req.path,
            method: req.method,
            requestId: req.requestId,
          },
        })
      }

      req.validatedBody = result.data
      return next()
    }
  }

  static validateQuery(schema: z.ZodSchema<any>) {
    return (req: any, res: any, next: any) => {
      const result = validateData(schema, req.query)
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Query parameters validation failed',
            details: Object.entries(result.errors).map(([field, message]) => ({
              field,
              message,
              value: req.query[field],
            })),
          },
          meta: {
            timestamp: new Date().toISOString(),
            path: req.path,
            method: req.method,
            requestId: req.requestId,
          },
        })
      }

      req.validatedQuery = result.data
      return next()
    }
  }
}

// Export types for convenience
export type {
  ChangePassword,
  EmailVerification,
  LoginCredentials,
  PasswordReset,
  PasswordResetRequest,
  ProfileUpdate,
  RegisterCredentials,
  ResendVerification,
}
