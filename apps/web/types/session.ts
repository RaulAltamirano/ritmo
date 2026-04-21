/**
 * User Session Types
 * Based on the backend UserSession model
 */

export interface UserSession {
  id: string
  userId: string
  sessionId: string
  deviceId?: string
  deviceName?: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browser?: string
  browserVersion?: string
  os?: string
  osVersion?: string
  ipAddress?: string
  userAgent?: string
  country?: string
  region?: string
  city?: string
  latitude?: number
  longitude?: number
  timezone?: string
  isActive: boolean
  isTrusted: boolean
  lastActivity: string // ISO date string
  expiresAt: string // ISO date string
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
}

export interface SessionResponse {
  success: boolean
  sessions?: UserSession[]
  error?: string
}

export interface TerminateSessionResponse {
  success: boolean
  message?: string
  error?: string
}
