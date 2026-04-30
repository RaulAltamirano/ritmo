/**
 * 👤 USER DTOs - RITMO API 2025
 *
 * Data Transfer Objects para el módulo de usuarios
 * Siguiendo Clean Architecture y Domain Driven Design
 */

import type { TimerPresetsDTO } from '../timerPresets.dto.js'

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
  /** Presets de timer (25/5, 52/17, 90/20); null en DB → el servicio devuelve defaults. */
  timerPresets: TimerPresetsDTO
  /** Preferencias de accesibilidad almacenadas en `UserPreferences.accessibilitySettings` */
  accessibility?: Record<string, unknown>
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
  timerPresets?: TimerPresetsDTO
  accessibility?: Record<string, unknown>
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
