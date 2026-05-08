import {
  getFieldError,
  hasFieldError,
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

// ========================================
// FRONTEND VALIDATION SCHEMAS
// ========================================

// Frontend-specific schemas with proper error messages
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
})

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, 'Username is required')
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be at most 30 characters')
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'Username can only contain letters, numbers, underscores, and hyphens',
      ),
    email: z.string().min(1, 'Email is required').email('Invalid email format'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
      ),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
    acceptTerms: z
      .boolean()
      .refine(val => val === true, 'You must accept the terms and conditions'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      'First name can only contain letters and spaces',
    )
    .optional(),
  lastName: z
    .string()
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Last name can only contain letters and spaces')
    .optional(),
  timezone: z.string().optional(),
  language: z.string().length(2, 'Language must be a 2-letter code').optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional(),
})

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(1, 'New password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
      ),
    confirmNewPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  })

export const emailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
})

export const passwordResetRequestSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
})

export const passwordResetSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
      ),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// ========================================
// RE-EXPORT SHARED TYPES AND UTILITIES
// ========================================

// Re-export shared types for convenience
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

// Re-export shared utility functions
export { getFieldError, hasFieldError, validateData }

// ========================================
// FRONTEND-SPECIFIC UTILITIES
// ========================================

// Password strength validation
export const validatePasswordStrength = (
  password: string,
): {
  score: number
  feedback: string[]
  isValid: boolean
} => {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) score++
  else feedback.push('At least 8 characters')

  if (/[a-z]/.test(password)) score++
  else feedback.push('At least one lowercase letter')

  if (/[A-Z]/.test(password)) score++
  else feedback.push('At least one uppercase letter')

  if (/\d/.test(password)) score++
  else feedback.push('At least one number')

  if (/[@$!%*?&]/.test(password)) score++
  else feedback.push('At least one special character (@$!%*?&)')

  return {
    score,
    feedback,
    isValid: score >= 4,
  }
}

// Email validation utility
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
