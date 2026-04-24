// ========================================
// DEVICE FINGERPRINTING EXPORTS
// ========================================

export * from './deviceFingerprint.js'

// ========================================
// CIRCADIAN (WALL-CLOCK)
// ========================================

export * from './circadian/phaseClock.js'

// ========================================
// COMMON TYPES AND UTILITIES
// ========================================

// Common types for the entire project
export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
}

export interface AuthUser {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  avatar?: string
  timezone: string
  language: string
  isActive: boolean
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Common utilities
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

// Constants
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  EVENTS: '/api/events',
  CALENDAR: '/api/calendar',
} as const

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const

// ========================================
// SHARED VALIDATION SCHEMAS
// ========================================

import { z } from 'zod'

// Base validation schemas that can be extended per context
export const baseValidationSchemas = {
  // Email validation (reusable)
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(255, 'Email too long')
    .trim()
    .toLowerCase(),

  // Username validation (reusable)
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, underscores, and hyphens',
    )
    .trim(),

  // Password validation (reusable)
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    ),

  // Name validation (reusable)
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be at most 50 characters')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      'First name can only contain letters and spaces',
    )
    .trim()
    .optional(),

  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be at most 50 characters')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Last name can only contain letters and spaces')
    .trim()
    .optional(),

  // Optional fields
  timezone: z.string().optional(),
  language: z.string().length(2, 'Language must be a 2-letter code').optional(),
  rememberMe: z.boolean().optional(),
}

// Device info validation
export const deviceInfoSchema = z
  .object({
    deviceId: z.string().optional(),
    deviceName: z.string().optional(),
    deviceType: z.enum(['desktop', 'mobile', 'tablet']).optional(),
    browser: z.string().optional(),
    os: z.string().optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
  })
  .optional()

// Auth validation schemas
export const authValidationSchemas = {
  // Login schema
  login: z.object({
    email: baseValidationSchemas.email,
    password: z.string().min(1, 'Password is required'),
    rememberMe: baseValidationSchemas.rememberMe,
    deviceInfo: deviceInfoSchema,
  }),

  // Registration schema
  register: z.object({
    email: baseValidationSchemas.email,
    username: baseValidationSchemas.username,
    password: baseValidationSchemas.password,
    firstName: baseValidationSchemas.firstName,
    lastName: baseValidationSchemas.lastName,
    timezone: baseValidationSchemas.timezone,
    language: baseValidationSchemas.language,
  }),

  // Password reset request
  passwordResetRequest: z.object({
    email: baseValidationSchemas.email,
  }),

  // Password reset
  passwordReset: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: baseValidationSchemas.password,
  }),

  // Profile update
  profileUpdate: z.object({
    firstName: baseValidationSchemas.firstName,
    lastName: baseValidationSchemas.lastName,
    timezone: baseValidationSchemas.timezone,
    language: baseValidationSchemas.language,
    avatar: z.string().url('Avatar must be a valid URL').optional(),
  }),

  // Change password
  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: baseValidationSchemas.password,
  }),

  // Email verification
  emailVerification: z.object({
    token: z.string().min(1, 'Verification token is required'),
  }),

  // Resend verification
  resendVerification: z.object({
    email: baseValidationSchemas.email,
  }),
}

// Export types
export type LoginCredentials = z.infer<typeof authValidationSchemas.login>
export type RegisterCredentials = z.infer<typeof authValidationSchemas.register>
export type PasswordResetRequest = z.infer<
  typeof authValidationSchemas.passwordResetRequest
>
export type PasswordReset = z.infer<typeof authValidationSchemas.passwordReset>
export type ProfileUpdate = z.infer<typeof authValidationSchemas.profileUpdate>
export type ChangePassword = z.infer<typeof authValidationSchemas.changePassword>
export type EmailVerification = z.infer<typeof authValidationSchemas.emailVerification>
export type ResendVerification = z.infer<
  typeof authValidationSchemas.resendVerification
>
export type DeviceInfo = z.infer<typeof deviceInfoSchema>

// Validation utility functions
export const validateData = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
):
  | {
      success: true
      data: T
    }
  | {
      success: false
      errors: Record<string, string>
    } => {
  try {
    const validatedData = schema.parse(data)
    return {
      success: true,
      data: validatedData,
    }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err: z.ZodIssue) => {
        const field = err.path.join('.')
        errors[field] = err.message
      })
      return {
        success: false,
        errors,
      }
    }

    return {
      success: false,
      errors: {
        general: 'Unknown validation error',
      },
    }
  }
}

export const getFieldError = (
  errors: Record<string, string>,
  field: string,
): string | undefined => {
  return errors[field]
}

export const hasFieldError = (
  errors: Record<string, string>,
  field: string,
): boolean => {
  return !!errors[field]
}
