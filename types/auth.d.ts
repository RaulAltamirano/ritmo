export interface AuthUser {
  id: string
  email: string
  name: string | null
  avatar: string | null
  timezone: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  preferences?: {
    theme: string
    language: string
    notificationsEnabled: boolean
    defaultTimeTechnique: string
  }
}

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

export interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
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
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AuthEvent {
  type: 'login' | 'logout' | 'register' | 'token_refresh' | 'password_reset' | 'email_verification'
  user?: AuthUser
  timestamp: Date
  metadata?: Record<string, unknown>
}
