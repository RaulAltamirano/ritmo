/**
 * 🚀 RITMO API STANDARDIZED RESPONSE TYPES
 *
 * These interfaces match the new standardized API response system
 * implemented in the backend for 2025 best practices
 */

// Response status types
export type ResponseStatus = 'success' | 'error' | 'partial'

// Error codes for consistent error handling
export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED',
  TOKEN_ROTATION_FAILED = 'TOKEN_ROTATION_FAILED',
  TOKEN_REUSE_DETECTED = 'TOKEN_REUSE_DETECTED',
  NO_TOKEN_PROVIDED = 'NO_TOKEN_PROVIDED',
  INVALID_TOKEN_TYPE = 'INVALID_TOKEN_TYPE',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // Resource Management
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  TASK_NOT_FOUND = 'TASK_NOT_FOUND',
  ACTIVITY_NOT_FOUND = 'ACTIVITY_NOT_FOUND',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',

  // Business Logic
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  MAX_SESSIONS_LIMIT_REACHED = 'MAX_SESSIONS_LIMIT_REACHED',
  SESSION_ALREADY_EXISTS = 'SESSION_ALREADY_EXISTS',

  // User Management
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INVALID_OR_EXPIRED_TOKEN = 'INVALID_OR_EXPIRED_TOKEN',

  // System Errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  REGISTRATION_FAILED = 'REGISTRATION_FAILED',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT_FAILED = 'LOGOUT_FAILED',
  LOGOUT_ALL_FAILED = 'LOGOUT_ALL_FAILED',
  GET_USER_FAILED = 'GET_USER_FAILED',
  GET_SESSIONS_FAILED = 'GET_SESSIONS_FAILED',
  TERMINATE_SESSION_FAILED = 'TERMINATE_SESSION_FAILED',
  SESSION_CLEANUP_FAILED = 'SESSION_CLEANUP_FAILED',
  GET_SESSION_STATS_FAILED = 'GET_SESSION_STATS_FAILED',
  GET_SECURITY_LOGS_FAILED = 'GET_SECURITY_LOGS_FAILED',
  PASSWORD_RESET_REQUEST_FAILED = 'PASSWORD_RESET_REQUEST_FAILED',
  PASSWORD_RESET_FAILED = 'PASSWORD_RESET_FAILED',
  DEVICE_CHALLENGE_FAILED = 'DEVICE_CHALLENGE_FAILED',
  GET_TASKS_FAILED = 'GET_TASKS_FAILED',
  CREATE_TASK_FAILED = 'CREATE_TASK_FAILED',
  GET_TASK_BY_ID_FAILED = 'GET_TASK_BY_ID_FAILED',
  UPDATE_TASK_FAILED = 'UPDATE_TASK_FAILED',
  DELETE_TASK_FAILED = 'DELETE_TASK_FAILED',
  GET_ACTIVITIES_FAILED = 'GET_ACTIVITIES_FAILED',
  CREATE_ACTIVITY_FAILED = 'CREATE_ACTIVITY_FAILED',
  GET_ACTIVITY_BY_ID_FAILED = 'GET_ACTIVITY_BY_ID_FAILED',
  UPDATE_ACTIVITY_FAILED = 'UPDATE_ACTIVITY_FAILED',
  DELETE_ACTIVITY_FAILED = 'DELETE_ACTIVITY_FAILED',

  // Security
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  DEVICE_VALIDATION_FAILED = 'DEVICE_VALIDATION_FAILED',
  SESSION_INVALIDATION_FAILED = 'SESSION_INVALIDATION_FAILED',
  TOKEN_REVOCATION_FAILED = 'TOKEN_REVOCATION_FAILED',
  SESSION_REVOCATION_FAILED = 'SESSION_REVOCATION_FAILED',
  SESSION_VALIDATION_FAILED = 'SESSION_VALIDATION_FAILED',
  CLEANUP_FAILED = 'CLEANUP_FAILED',
  SESSION_STATS_FAILED = 'SESSION_STATS_FAILED',
  SESSION_LOOKUP_FAILED = 'SESSION_LOOKUP_FAILED',
  SESSION_CHECK_FAILED = 'SESSION_CHECK_FAILED',
  SESSION_CONSOLIDATION_FAILED = 'SESSION_CONSOLIDATION_FAILED',
  SESSION_UPDATE_FAILED = 'SESSION_UPDATE_FAILED',
  SESSION_CREATION_FAILED = 'SESSION_CREATION_FAILED',
  INTELLIGENT_LOGIN_FAILED = 'INTELLIGENT_LOGIN_FAILED',
  SESSION_LIMIT_ENFORCEMENT_FAILED = 'SESSION_LIMIT_ENFORCEMENT_FAILED',
  SESSION_ACTIVITY_UPDATE_FAILED = 'SESSION_ACTIVITY_UPDATE_FAILED',
  SESSION_DEACTIVATION_FAILED = 'SESSION_DEACTIVATION_FAILED',
  ALL_USER_SESSIONS_DEACTIVATION_FAILED = 'ALL_USER_SESSIONS_DEACTIVATION_FAILED',
}

// Error detail interface
export interface ErrorDetail {
  field?: string
  message: string
  value?: any
  code?: string
}

// Base response interface
export interface ApiResponse<T = any> {
  success: boolean
  status: ResponseStatus
  data?: T
  error?: {
    code: ErrorCode | string
    message: string
    details?: ErrorDetail[]
    stack?: string
  }
  message?: string
  meta?: {
    timestamp: string
    requestId?: string
    version?: string
    path?: string
    method?: string
    duration?: number
  }
}

// Success response interface
export interface SuccessResponse<T = any> extends ApiResponse<T> {
  success: true
  status: 'success'
  data: T
  message?: string
  meta?: {
    timestamp: string
    requestId?: string
    version?: string
    path?: string
    method?: string
    duration?: number
  }
}

// Error response interface
export interface ErrorResponse extends ApiResponse {
  success: false
  status: 'error'
  error: {
    code: ErrorCode | string
    message: string
    details?: ErrorDetail[]
    stack?: string
  }
  meta?: {
    timestamp: string
    requestId?: string
    version?: string
    path?: string
    method?: string
    duration?: number
  }
}

// Partial success response interface
export interface PartialResponse<T = any> extends ApiResponse<T> {
  success: true
  status: 'partial'
  data: T
  message: string
  error?: {
    code: 'PARTIAL_SUCCESS'
    message: string
    details?: ErrorDetail[]
  }
  meta?: {
    timestamp: string
    requestId?: string
    version?: string
    path?: string
    method?: string
    duration?: number
  }
}

// Pagination interface
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
}

// Generic list response with pagination
export interface ListResponse<T> extends SuccessResponse<T[]> {
  data: T[]
  pagination?: PaginationMeta
}

// Auth specific responses
export interface AuthResponse
  extends SuccessResponse<{
    user: any
    tokens?: {
      accessToken: string
      refreshToken: string
    }
  }> {}

export interface LoginResponse extends AuthResponse {}
export interface RegisterResponse extends AuthResponse {}
export interface ProfileResponse extends SuccessResponse<any> {}

// Task specific responses
export interface TaskResponse extends SuccessResponse<any> {}
export interface TasksListResponse extends ListResponse<any> {}

// Activity specific responses
export interface ActivityResponse extends SuccessResponse<any> {}
export interface ActivitiesListResponse extends ListResponse<any> {}

// Session specific responses
export interface SessionsResponse
  extends SuccessResponse<{
    sessions: any[]
  }> {}

export interface SessionStatsResponse
  extends SuccessResponse<{
    stats: any
  }> {}

export interface SecurityLogsResponse
  extends SuccessResponse<{
    logs: any[]
  }> {}

// Health check response
export interface HealthResponse
  extends SuccessResponse<{
    status: string
    timestamp: string
    uptime: number
    environment: string
    version: string
  }> {}

// Type guards
export const isSuccessResponse = <T>(
  response: ApiResponse<T>,
): response is SuccessResponse<T> => {
  return response.success === true && response.status === 'success'
}

export const isErrorResponse = (response: ApiResponse): response is ErrorResponse => {
  return response.success === false && response.status === 'error'
}

export const isPartialResponse = <T>(
  response: ApiResponse<T>,
): response is PartialResponse<T> => {
  return response.success === true && response.status === 'partial'
}

// Utility type for extracting data from response
export type ExtractData<T> = T extends ApiResponse<infer U> ? U : never

// Utility type for API endpoints
export type ApiEndpoint = string

// Generic API function type
export type ApiFunction<TData, TParams = void> = (
  params: TParams,
) => Promise<ApiResponse<TData>>
