import {
  loginSchema,
  passwordChangeSchema,
  profileUpdateSchema,
  registerSchema,
} from '@/utils/validation'
import { describe, expect, it } from 'vitest'

describe('🔍 Validation Schemas', () => {
  describe('Login Schema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should require email', () => {
      const invalidData = {
        password: 'SecurePass123!',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Required')
      }
    })

    it('should require password', () => {
      const invalidData = {
        email: 'test@example.com',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Required')
      }
    })

    it('should validate email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'SecurePass123!',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email format')
      }
    })

    it('should validate password length', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Password must be at least 8 characters',
        )
      }
    })

    it('should handle optional rememberMe', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        rememberMe: true,
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('Register Schema', () => {
    it('should validate valid registration data', () => {
      const validData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        acceptTerms: true,
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should require username', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        acceptTerms: true,
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Required')
      }
    })

    it('should validate username length', () => {
      const invalidData = {
        username: 'ab',
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        acceptTerms: true,
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Username must be at least 3 characters',
        )
      }
    })

    it('should validate username format', () => {
      const invalidData = {
        username: 'test@user',
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        acceptTerms: true,
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Username can only contain letters, numbers, underscores, and hyphens',
        )
      }
    })

    it('should validate email format', () => {
      const invalidData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        acceptTerms: true,
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email format')
      }
    })

    it('should validate password strength', () => {
      const invalidData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        acceptTerms: true,
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Password must be at least 8 characters',
        )
      }
    })

    it('should validate password confirmation', () => {
      const invalidData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!',
        acceptTerms: true,
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Passwords do not match')
      }
    })

    it('should require terms acceptance', () => {
      const invalidData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        acceptTerms: false,
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'You must accept the terms and conditions',
        )
      }
    })
  })

  describe('Profile Update Schema', () => {
    it('should validate valid profile data', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        timezone: 'UTC',
        language: 'en',
      }

      const result = profileUpdateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate firstName format', () => {
      const invalidData = {
        firstName: 'John123',
        lastName: 'Doe',
        timezone: 'UTC',
        language: 'en',
      }

      const result = profileUpdateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'First name can only contain letters and spaces',
        )
      }
    })

    it('should validate lastName format', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe123',
        timezone: 'UTC',
        language: 'en',
      }

      const result = profileUpdateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Last name can only contain letters and spaces',
        )
      }
    })

    it('should validate avatar URL', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        timezone: 'UTC',
        language: 'en',
        avatar: 'not-a-url',
      }

      const result = profileUpdateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Avatar must be a valid URL')
      }
    })

    it('should validate language length', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        timezone: 'UTC',
        language: 'eng',
      }

      const result = profileUpdateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Language must be a 2-letter code')
      }
    })
  })

  describe('Password Change Schema', () => {
    it('should validate valid password change data', () => {
      const validData = {
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
        confirmNewPassword: 'NewPass123!',
      }

      const result = passwordChangeSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should require current password', () => {
      const invalidData = {
        newPassword: 'NewPass123!',
        confirmNewPassword: 'NewPass123!',
      }

      const result = passwordChangeSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Required')
      }
    })

    it('should validate new password strength', () => {
      const invalidData = {
        currentPassword: 'OldPass123!',
        newPassword: 'weak',
        confirmNewPassword: 'weak',
      }

      const result = passwordChangeSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Password must be at least 8 characters',
        )
      }
    })

    it('should validate password confirmation', () => {
      const invalidData = {
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
        confirmNewPassword: 'DifferentPass123!',
      }

      const result = passwordChangeSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Passwords do not match')
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty strings', () => {
      const invalidData = {
        username: '',
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        acceptTerms: true,
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should handle whitespace-only strings', () => {
      const invalidData = {
        username: '   ',
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        acceptTerms: true,
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should handle very long strings', () => {
      const invalidData = {
        username: 'a'.repeat(31),
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        acceptTerms: true,
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Username must be at most 30 characters',
        )
      }
    })

    it('should handle special characters in email', () => {
      const validData = {
        email: 'test+tag@example.com',
        password: 'SecurePass123!',
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})
