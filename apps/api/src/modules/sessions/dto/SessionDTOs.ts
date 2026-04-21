/**
 * 🎫 SESSION DTOs - RITMO API 2025
 *
 * Data Transfer Objects para el módulo de sesiones
 * Siguiendo Clean Architecture y Domain Driven Design
 */

// ========================================
// SESSION DTOs
// ========================================

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
  deviceTrust: 'low' | 'medium' | 'high'
}

export interface SessionStatsDTO {
  totalSessions: number
  activeSessions: number
  inactiveSessions: number
  averageSessionDuration: number
  lastLoginAt: Date
  deviceTypes: {
    desktop: number
    mobile: number
    tablet: number
  }
  browsers: {
    [browser: string]: number
  }
  operatingSystems: {
    [os: string]: number
  }
}

export interface DeactivateSessionRequestDTO {
  sessionId: string
}

export interface DeactivateAllSessionsRequestDTO {
  confirm: boolean
}

// ========================================
// RESPONSE DTOs
// ========================================

export interface SessionsResponseDTO {
  sessions: SessionDTO[]
}

export interface SessionStatsResponseDTO {
  stats: SessionStatsDTO
}

export interface DeactivateSessionResponseDTO {
  success: boolean
  message: string
}
