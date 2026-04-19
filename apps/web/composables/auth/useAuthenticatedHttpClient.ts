/**
 * 🚀 RITMO AUTHENTICATED HTTP CLIENT - 2025 BEST PRACTICES
 *
 * Enhanced HTTP client with automatic token refresh:
 * - HttpOnly cookie-based authentication
 * - Automatic refresh on 401 responses
 * - Exponential backoff retry mechanism
 * - Request deduplication during refresh
 * - Comprehensive error handling
 */

import { navigateTo } from '#app'
import type { RequestOptions } from '../shared/useHttpClient'
import { useHttpClient } from '../shared/useHttpClient'
import { useAuthAPI } from './useAuthAPI'
import { updateGlobalRefreshState } from './useGlobalRefreshState'

// Global state for refresh management
let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null
let failedQueue: Array<{
  resolve: (value: any) => void
  reject: (error: any) => void
}> = []

export const useAuthenticatedHttpClient = () => {
  const httpClient = useHttpClient()
  const authAPI = useAuthAPI()

  /**
   * Process queue of failed requests after refresh
   */
  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error)
      } else {
        resolve(token)
      }
    })

    failedQueue = []
  }

  /**
   * Attempt token refresh with exponential backoff
   */
  const attemptTokenRefresh = async (): Promise<boolean> => {
    try {
      console.log('🔄 Attempting token refresh...')
      const response = await authAPI.refreshToken()
      console.log('🔄 Token refresh result:', response.success)

      if (response.success) {
        console.log('✅ Token refresh successful - new tokens set via HttpOnly cookies')
      } else {
        console.warn('⚠️ Token refresh failed - response indicates failure')
      }

      return response.success
    } catch (error) {
      console.warn('❌ Token refresh failed with error:', error)
      return false
    }
  }

  /**
   * Check if error is an authentication error
   */
  const isAuthenticationError = (error: any): boolean => {
    return (
      error?.status === 401 ||
      error?.statusCode === 401 ||
      error?.error?.code === 'UNAUTHORIZED' ||
      (error?.data && error.data.error?.code === 'UNAUTHORIZED')
    )
  }

  /**
   * Retry mechanism with exponential backoff
   */
  const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000,
  ): Promise<T> => {
    let lastError: any

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error

        // Don't retry on authentication errors
        if (isAuthenticationError(error)) {
          throw error
        }

        // Check if we've reached max retries
        if (attempt >= maxRetries) {
          throw error
        }

        // Calculate delay with exponential backoff and jitter
        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 8000)
        const jitter = Math.random() * 500
        await new Promise(resolve => setTimeout(resolve, delay + jitter))
      }
    }

    throw lastError!
  }

  /**
   * Make authenticated request with automatic refresh
   */
  const makeAuthenticatedRequest = async (
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<any> => {
    // Get device fingerprint for security
    const { getCurrentDeviceFingerprint } = await import(
      '../../utils/deviceFingerprint'
    )
    const deviceFingerprint = await getCurrentDeviceFingerprint()

    const authOptions: RequestOptions = {
      ...options,
      credentials: 'include' as RequestCredentials, // Ensure HttpOnly cookies are sent
      headers: {
        ...options.headers,
        'X-Device-Id': deviceFingerprint.deviceId,
        'X-Device-Type': deviceFingerprint.deviceType,
        'X-Device-Browser': deviceFingerprint.browser,
        'X-Device-OS': deviceFingerprint.os,
      },
    }

    try {
      // Make the HTTP request
      const response = await httpClient.fetch(endpoint, authOptions)
      return response
    } catch (error: any) {
      console.error('❌ Authenticated request failed:', error)

      // Check for 401 Unauthorized responses
      if (isAuthenticationError(error)) {
        console.log('🔄 401 detected, attempting token refresh...')
        return handleUnauthorizedRequest(endpoint, authOptions)
      }

      // Re-throw other errors
      throw error
    }
  }

  /**
   * Handle unauthorized requests with refresh attempt
   */
  const handleUnauthorizedRequest = async (
    endpoint: string,
    options: RequestOptions,
  ): Promise<any> => {
    // If already refreshing, queue this request
    if (isRefreshing) {
      console.log('🔄 Already refreshing, queuing request...')
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then(() => {
          return httpClient.fetch(endpoint, options)
        })
        .catch(error => {
          throw error
        })
    }

    console.log('🔄 Starting token refresh process...')
    isRefreshing = true
    refreshPromise = attemptTokenRefresh()

    // Update global state
    updateGlobalRefreshState({
      isRefreshing: true,
      hasRefreshPromise: true,
      queueLength: failedQueue.length,
    })

    try {
      const refreshSuccess = await refreshPromise

      if (refreshSuccess) {
        console.log('✅ Token refresh successful, retrying original request...')
        // Process queued requests
        processQueue(null, null)

        // Retry the original request
        return await retryWithBackoff(() => httpClient.fetch(endpoint, options))
      } else {
        console.log('❌ Token refresh failed, clearing auth...')
        // Refresh failed, process queue with error
        processQueue(new Error('Token refresh failed'))

        // Clear authentication state and redirect
        return handleAuthFailure()
      }
    } catch (error) {
      console.log('❌ Token refresh error:', error)
      // Refresh failed, process queue with error
      processQueue(error)

      // Clear authentication state and redirect
      return handleAuthFailure()
    } finally {
      isRefreshing = false
      refreshPromise = null

      // Update global state
      updateGlobalRefreshState({
        isRefreshing: false,
        hasRefreshPromise: false,
        queueLength: failedQueue.length,
      })
    }
  }

  /**
   * Handle authentication failure
   */
  const handleAuthFailure = async (): Promise<never> => {
    console.log('🚪 Handling authentication failure...')

    // Clear authentication state
    const { useAuthStore } = await import('@/stores/auth')
    const authStore = useAuthStore()
    authStore.clearAuth()

    // Redirect to login
    if (process.client) {
      await navigateTo('/auth/login?reason=authentication_required')
    }

    return Promise.reject(new Error('Authentication required'))
  }

  /**
   * Authenticated GET request
   */
  const get = async <T>(
    endpoint: string,
    options: Omit<RequestOptions, 'method'> = {},
  ) => {
    return makeAuthenticatedRequest(endpoint, { ...options, method: 'GET' })
  }

  /**
   * Authenticated POST request
   */
  const post = async <T>(
    endpoint: string,
    data?: any,
    options: Omit<RequestOptions, 'method' | 'body'> = {},
  ) => {
    return makeAuthenticatedRequest(endpoint, {
      ...options,
      method: 'POST',
      body: data,
    })
  }

  /**
   * Authenticated PUT request
   */
  const put = async <T>(
    endpoint: string,
    data?: any,
    options: Omit<RequestOptions, 'method' | 'body'> = {},
  ) => {
    return makeAuthenticatedRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Authenticated DELETE request
   */
  const del = async <T>(
    endpoint: string,
    options: Omit<RequestOptions, 'method'> = {},
  ) => {
    return makeAuthenticatedRequest(endpoint, { ...options, method: 'DELETE' })
  }

  /**
   * Authenticated PATCH request
   */
  const patch = async <T>(
    endpoint: string,
    data?: any,
    options: Omit<RequestOptions, 'method' | 'body'> = {},
  ) => {
    return makeAuthenticatedRequest(endpoint, {
      ...options,
      method: 'PATCH',
      body: data,
    })
  }

  /**
   * Get refresh status
   */
  const getRefreshStatus = () => ({
    isRefreshing,
    hasRefreshPromise: !!refreshPromise,
    queueLength: failedQueue.length,
  })

  /**
   * Get refresh status for external access
   */
  const getGlobalRefreshStatus = () => ({
    isRefreshing,
    hasRefreshPromise: !!refreshPromise,
    queueLength: failedQueue.length,
  })

  return {
    // Core authenticated methods
    get,
    post,
    put,
    del,
    patch,

    // Utility methods
    makeAuthenticatedRequest,
    getRefreshStatus,
    getGlobalRefreshStatus,

    // Refresh management
    attemptTokenRefresh,
    retryWithBackoff,
  }
}
