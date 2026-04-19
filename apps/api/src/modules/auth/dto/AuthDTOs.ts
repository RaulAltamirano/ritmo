/**
 * 📋 AUTH DTOs - RITMO API 2025
 *
 * Data Transfer Objects para el módulo de autenticación
 * Define las interfaces de datos para comunicación entre capas
 */

export interface RegisterDTO {
  email: string
  username: string
  password: string
  firstName?: string
  lastName?: string
  timezone?: string
  language?: string
}

export interface LoginDTO {
  email: string
  password: string
  rememberMe?: boolean
  deviceInfo?: {
    deviceId?: string
    deviceName?: string
    deviceType?: string
    browser?: string
    os?: string
    ipAddress?: string
    userAgent?: string
  }
}

export interface AuthResponseDTO {
  user: UserDTO
  accessToken: string
  refreshToken: string
  sessionId: string
  deviceTrust?: 'high' | 'medium' | 'low'
}

export interface UserDTO {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  avatar?: string
  timezone?: string
  language?: string
  isActive: boolean
  isEmailVerified: boolean
  role: string
  createdAt: Date
  updatedAt: Date
}

export interface PasswordResetRequestDTO {
  email: string
}

export interface PasswordResetDTO {
  token: string
  password: string
}

export interface PasswordChangeDTO {
  currentPassword: string
  newPassword: string
}

export interface ProfileUpdateDTO {
  firstName?: string
  lastName?: string
  timezone?: string
  language?: string
  avatar?: string
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
  theme: 'light' | 'dark' | 'auto'
}

export interface SessionDTO {
  id: string
  userId: string
  deviceId: string
  deviceName: string
  deviceType: string
  browser: string
  os: string
  ipAddress: string
  userAgent: string
  isActive: boolean
  lastActivityAt: Date
  createdAt: Date
  deviceTrust: 'high' | 'medium' | 'low'
}

export interface DeviceDTO {
  id: string
  userId: string
  deviceName: string
  deviceType: string
  browser: string
  os: string
  ipAddress: string
  userAgent: string
  isTrusted: boolean
  lastSeenAt: Date
  createdAt: Date
}

export interface SecurityLogDTO {
  id: string
  userId: string
  eventType: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  metadata?: Record<string, any>
  createdAt: Date
}

export interface EmailVerificationDTO {
  token: string
}

export interface SecuritySummaryDTO {
  totalSessions: number
  activeSessions: number
  trustedDevices: number
  recentLogins: number
  failedAttempts: number
  lastPasswordChange?: Date
  twoFactorEnabled: boolean
  emailVerified: boolean
}
