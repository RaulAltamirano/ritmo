// Auth Types for the API - Using shared types from @ritmo/shared
export type {
  AuthUser,
  ChangePassword,
  DeviceInfo,
  EmailVerification,
  LoginCredentials,
  PasswordReset,
  PasswordResetRequest,
  ProfileUpdate,
  RegisterCredentials,
  ResendVerification,
} from '@ritmo/shared'

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

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export enum AuthErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  INVALID_TOKEN = 'INVALID_TOKEN',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AuthError {
  code: AuthErrorCode
  message: string
}
