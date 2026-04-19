/**
 * 👤 USER DTOs - RITMO API 2025
 *
 * Data Transfer Objects para el módulo de usuarios
 * Siguiendo Clean Architecture y Domain Driven Design
 */

// ========================================
// USER DTOs
// ========================================

export interface UserDTO {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  avatar: string
  timezone: string
  language: string
  isActive: boolean
  isEmailVerified: boolean
  role: string
  createdAt: Date
  updatedAt: Date
}

export interface ProfileUpdateDTO {
  firstName?: string
  lastName?: string
  avatar?: string
  timezone?: string
  language?: string
}

export interface UserPreferencesDTO {
  timezone: string
  language: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends'
    showEmail: boolean
    showLastSeen: boolean
  }
  theme: 'light' | 'dark' | 'system'
}

// ========================================
// REQUEST DTOs
// ========================================

export interface UpdateProfileRequestDTO {
  firstName?: string
  lastName?: string
  avatar?: string
  timezone?: string
  language?: string
}

export interface UpdatePreferencesRequestDTO {
  timezone?: string
  language?: string
  notifications?: {
    email?: boolean
    push?: boolean
    sms?: boolean
  }
  privacy?: {
    profileVisibility?: 'public' | 'private' | 'friends'
    showEmail?: boolean
    showLastSeen?: boolean
  }
  theme?: 'light' | 'dark' | 'system'
}

// ========================================
// RESPONSE DTOs
// ========================================

export interface UserResponseDTO {
  user: UserDTO
}

export interface PreferencesResponseDTO {
  preferences: UserPreferencesDTO
}

export interface UpdateProfileResponseDTO {
  user: UserDTO
}

export interface UpdatePreferencesResponseDTO {
  preferences: UserPreferencesDTO
}
