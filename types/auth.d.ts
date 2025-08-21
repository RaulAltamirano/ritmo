// Auth Types and Interfaces
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  emailVerified?: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthUser extends User {
  profile?: UserProfile
  preferences?: UserPreferences
}

export interface UserProfile {
  id: string
  userId: string
  bio?: string
  timezone: string
  language: string
  createdAt: string
  updatedAt: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  notifications: {
    email: boolean
    push: boolean
    reminders: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private'
    activityVisibility: 'public' | 'private' | 'friends'
  }
}

// Auth State
export interface AuthState {
  user: AuthUser | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Auth Actions
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterCredentials {
  email: string
  password: string
  name: string
  acceptTerms: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginResponse {
  user: AuthUser
  tokens: AuthTokens
  message?: string
}

export interface RegisterResponse {
  user: AuthUser
  tokens: AuthTokens
  message?: string
}

export interface RefreshTokenResponse {
  accessToken: string
  expiresIn: number
}

// Auth Errors
export interface AuthError {
  code: string
  message: string
  field?: string
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Auth Guards
export interface AuthGuard {
  requiresAuth: boolean
  roles?: string[]
  permissions?: string[]
  redirectTo?: string
}

// Auth Events
export interface AuthEvent {
  type: 'login' | 'logout' | 'register' | 'token_refresh' | 'password_reset' | 'email_verification'
  user?: AuthUser
  timestamp: Date
  metadata?: Record<string, any>
} 