export interface SessionConsolidationStrategy {
  maxSessionsPerUser: number
  maxSessionsPerDevice: number
  autoConsolidate: boolean
  preserveTrustedSessions: boolean
  sessionTimeout: number
}

export interface DeviceInfo {
  deviceId: string
  deviceName: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browser: string
  browserVersion?: string
  os: string
  osVersion?: string
  ipAddress: string
  userAgent: string
  country?: string
  region?: string
  city?: string
  latitude?: number
  longitude?: number
  timezone?: string
}

export interface SessionTokens {
  accessToken: string
  refreshToken: string
}

export interface SessionUpdateData {
  accessToken: string
  refreshToken: string
  lastActivity?: Date
  expiresAt?: Date
}

export interface SessionCreationData {
  accessToken: string
  refreshToken: string
  deviceInfo?: DeviceInfo
}

export interface IntelligentLoginResult {
  session: any // UserSession from Prisma
  isNewSession: boolean
  message: string
}

export interface SessionStats {
  totalSessions: number
  activeSessions: number
  expiredSessions: number
  sessionsByDevice: Record<string, number>
}
