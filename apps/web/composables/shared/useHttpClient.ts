/**
 * 🚀 RITMO HTTP CLIENT - 2025 BEST PRACTICES
 *
 * Enhanced HTTP client that handles standardized API responses
 * and provides comprehensive error handling with validation
 */

import { config } from '@/config/environment'
import {
  isErrorResponse,
  isPartialResponse,
  isSuccessResponse,
  type ApiResponse,
  type ErrorResponse,
  type PartialResponse,
  type SuccessResponse,
} from '@/types/api.d'
import {
  handleApiError,
  handleGenericError,
  type ErrorHandlerConfig,
} from '@/utils/errorHandler'

export interface HttpClientConfig {
  baseURL?: string
  credentials?: RequestCredentials
  headers?: Record<string, string>
  timeout?: number
  errorHandling?: ErrorHandlerConfig
  retries?: number
  retryDelay?: number
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  headers?: Record<string, string>
  params?: Record<string, any>
  timeout?: number
  errorHandling?: ErrorHandlerConfig
  retries?: number
  retryDelay?: number
  credentials?: RequestCredentials
}

export interface RequestMetrics {
  startTime: number
  duration: number
  endpoint: string
  method: string
  success: boolean
  statusCode?: number
  errorCode?: string
  requestId?: string
  retries?: number
}

export const useHttpClient = () => {

  const defaultConfig: HttpClientConfig = {
    baseURL: config.api.baseUrl,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000,
    retries: 0, // DESHABILITADO: No reintentos automáticos
    retryDelay: 1000,
    errorHandling: {
      language: 'es',
      showTechnicalDetails: false,
      logErrors: true,
      showNotifications: true,
    },
  }

  /**
   * Generate unique request ID
   */
  const generateRequestId = (): string => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Check if error is retryable
   */
  const isRetryableError = (error: any): boolean => {
    // CORS errors are NEVER retryable
    if (error?.message?.includes('CORS') || error?.name === 'CORS') {
      return false
    }

    // Network errors that might be temporary
    if (error?.message?.includes('Network Error') || error?.name === 'NetworkError') {
      return true
    }

    // HTTP status codes that might be retryable
    if (error?.status) {
      const retryableStatuses = [408, 429, 500, 502, 503, 504]
      if (retryableStatuses.includes(error.status)) {
        return true
      }
    }

    if (!error?.code) return false

    const nonRetryableCodes = [
      'UNAUTHORIZED',
      'FORBIDDEN',
      'INVALID_TOKEN',
      'TOKEN_EXPIRED',
      'ACCOUNT_LOCKED',
      'ACCOUNT_DISABLED',
      'VALIDATION_ERROR',
      'BUSINESS_RULE_VIOLATION',
      'NOT_FOUND',
      'DUPLICATE_ENTRY',
    ]

    return !nonRetryableCodes.includes(error.code)
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  const calculateRetryDelay = (attempt: number, baseDelay: number): number => {
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 8000)
    const jitter = Math.random() * 500
    return delay + jitter
  }

  /**
   * Retry operation with exponential backoff
   */
  const withRetry = async <T>(
    operation: () => Promise<T>,
    maxRetries: number,
    baseDelay: number,
  ): Promise<T> => {
    let lastError: any

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error

        // Check if error is retryable
        if (!isRetryableError(error)) {
          throw error
        }

        // Check if we've reached max retries
        if (attempt >= maxRetries) {
          throw error
        }

        // Wait before retrying with exponential backoff
        const delay = calculateRetryDelay(attempt, baseDelay)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  }

  /**
   * Enhanced fetch that handles standardized API responses
   */
  const enhancedFetch = async <T extends ApiResponse>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> => {
    const startTime = Date.now()
    const finalConfig = { ...defaultConfig, ...options }
    const { errorHandling = {}, retries = 0, retryDelay = 1000 } = finalConfig
    const requestId = generateRequestId()

    const executeRequest = async (): Promise<T> => {
      try {
        const response = await $fetch<T>(endpoint, {
          baseURL: finalConfig.baseURL,
          credentials: finalConfig.credentials,
          headers: {
            ...finalConfig.headers,
            ...options.headers,
            'X-Request-ID': requestId,
          },
          method: options.method || 'GET',
          body: options.body,
          params: options.params,
          timeout: options.timeout || finalConfig.timeout,
        })

        const duration = Date.now() - startTime

        // Validate response structure
        if (!response || typeof response !== 'object') {
          throw new Error('Invalid response format')
        }

        // Check if response has the expected structure
        if (!('success' in response) || !('status' in response)) {
          // Response does not match standardized format
        }

        return response
      } catch (error: any) {
        const lastError = handleGenericError(error, errorHandling)

        const duration = Date.now() - startTime

        // Enhanced error logging for CORS and network issues
        const errorType = error?.message?.includes('CORS')
          ? 'CORS'
          : error?.name === 'NetworkError'
            ? 'NETWORK'
            : error?.status
              ? `HTTP_${error.status}`
              : 'UNKNOWN'

        console.error(`[FAIL] Request failed: ${endpoint}`, {
          type: errorType,
          status: error?.status,
          message: error?.message,
          duration: `${duration}ms`,
          errorCode: lastError.code,
          userMessage: lastError.userMessage,
          requestId,
          retryable: isRetryableError(error),
        })

        throw lastError
      }
    }

    // Execute with retry logic ONLY if retries > 0 AND error is retryable
    if (retries > 0) {
      return withRetry(executeRequest, retries, retryDelay)
    }

    // Single request execution (no retries)
    return executeRequest()
  }

  /**
   * GET request with standardized response handling
   */
  const get = async <T>(
    endpoint: string,
    options: Omit<RequestOptions, 'method'> = {},
  ): Promise<SuccessResponse<T>> => {
    const response = await enhancedFetch<ApiResponse<T>>(endpoint, {
      ...options,
      method: 'GET',
    })

    if (isSuccessResponse(response)) {
      return response as SuccessResponse<T>
    }

    if (isErrorResponse(response)) {
      throw handleApiError(response, options.errorHandling)
    }

    if (isPartialResponse(response)) {
      // Handle partial success - return data without warning
      return {
        ...response,
        success: true,
        status: 'success',
      } as SuccessResponse<T>
    }

    throw new Error('Unexpected response format')
  }

  /**
   * POST request with standardized response handling
   */
  const post = async <T>(
    endpoint: string,
    data: any,
    options: Omit<RequestOptions, 'method' | 'body'> = {},
  ): Promise<SuccessResponse<T>> => {
    const response = await enhancedFetch<ApiResponse<T>>(endpoint, {
      ...options,
      method: 'POST',
      body: data,
    })

    if (isSuccessResponse(response)) {
      return response as SuccessResponse<T>
    }

    if (isErrorResponse(response)) {
      throw handleApiError(response, options.errorHandling)
    }

    if (isPartialResponse(response)) {
      // Handle partial success - return data without warning
      return {
        ...response,
        success: true,
        status: 'success',
      } as SuccessResponse<T>
    }

    throw new Error('Unexpected response format')
  }

  /**
   * PUT request with standardized response handling
   */
  const put = async <T>(
    endpoint: string,
    data: any,
    options: Omit<RequestOptions, 'method' | 'body'> = {},
  ): Promise<SuccessResponse<T>> => {
    const response = await enhancedFetch<ApiResponse<T>>(endpoint, {
      ...options,
      method: 'PUT',
      body: data,
    })

    if (isSuccessResponse(response)) {
      return response as SuccessResponse<T>
    }

    if (isErrorResponse(response)) {
      throw handleApiError(response, options.errorHandling)
    }

    if (isPartialResponse(response)) {
      // Handle partial success - return data without warning
      return {
        ...response,
        success: true,
        status: 'success',
      } as SuccessResponse<T>
    }

    throw new Error('Unexpected response format')
  }

  /**
   * DELETE request with standardized response handling
   */
  const del = async <T>(
    endpoint: string,
    options: Omit<RequestOptions, 'method'> = {},
  ): Promise<SuccessResponse<T>> => {
    const response = await enhancedFetch<ApiResponse<T>>(endpoint, {
      ...options,
      method: 'DELETE',
    })

    if (isSuccessResponse(response)) {
      return response as SuccessResponse<T>
    }

    if (isErrorResponse(response)) {
      throw handleApiError(response, options.errorHandling)
    }

    if (isPartialResponse(response)) {
      // Handle partial success - return data without warning
      return {
        ...response,
        success: true,
        status: 'success',
      } as SuccessResponse<T>
    }

    throw new Error('Unexpected response format')
  }

  /**
   * PATCH request with standardized response handling
   */
  const patch = async <T>(
    endpoint: string,
    data: any,
    options: Omit<RequestOptions, 'method' | 'body'> = {},
  ): Promise<SuccessResponse<T>> => {
    const response = await enhancedFetch<ApiResponse<T>>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data,
    })

    if (isSuccessResponse(response)) {
      return response as SuccessResponse<T>
    }

    if (isErrorResponse(response)) {
      throw handleApiError(response, options.errorHandling)
    }

    if (isPartialResponse(response)) {
      // Handle partial success - return data without warning
      return {
        ...response,
        success: true,
        status: 'success',
      } as SuccessResponse<T>
    }

    throw new Error('Unexpected response format')
  }

  /**
   * Generic fetch method for custom requests
   */
  const fetch = async <T extends ApiResponse>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> => {
    return enhancedFetch<T>(endpoint, options)
  }

  /**
   * Health check endpoint
   */
  const healthCheck = async (): Promise<boolean> => {
    try {
      const response = await get<{ status: string }>('/health')
      return response.data.status === 'healthy'
    } catch (error) {
      console.error('Health check failed:', error)
      return false
    }
  }

  /**
   * Extract data from success response
   */
  const extractData = <T>(response: SuccessResponse<T>): T => {
    return response.data
  }

  /**
   * Check if response is successful
   */
  const isSuccess = <T>(response: ApiResponse<T>): response is SuccessResponse<T> => {
    return isSuccessResponse(response)
  }

  /**
   * Check if response is an error
   */
  const isError = <T>(response: ApiResponse<T>): response is ErrorResponse => {
    return isErrorResponse(response)
  }

  /**
   * Check if response is partial
   */
  const isPartial = <T>(response: ApiResponse<T>): response is PartialResponse<T> => {
    return isPartialResponse(response)
  }

  /**
   * Get request metrics
   */
  const getRequestMetrics = (): RequestMetrics | null => {
    // This would be implemented to track metrics across requests
    return null
  }

  return {
    // Core methods
    get,
    post,
    put,
    del,
    patch,
    fetch,
    healthCheck,

    // Utility methods
    extractData,
    isSuccess,
    isError,
    isPartial,
    getRequestMetrics,

    // Configuration
    defaultConfig,
  }
}
