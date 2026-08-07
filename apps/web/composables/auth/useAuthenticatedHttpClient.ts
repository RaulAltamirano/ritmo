/**
 * 🚀 RITMO AUTHENTICATED HTTP CLIENT - 2025 BEST PRACTICES
 *
 * Enhanced HTTP client with automatic token refresh:
 * - HttpOnly cookie-based authentication
 * - Automatic refresh on 401 responses
 * - Exponential backoff retry mechanism
 * - Single-flight refresh via shared runner
 * - Comprehensive error handling
 */

import { isAuthenticationError } from '@/utils/authError'
import type { RequestOptions } from '../shared/useHttpClient'
import { useHttpClient } from '../shared/useHttpClient'
import { useAuthAPI } from './useAuthAPI'
import {
  getGlobalRefreshState,
  runSingleFlightRefresh,
} from './useGlobalRefreshState'

export const useAuthenticatedHttpClient = () => {
  const httpClient = useHttpClient()
  const authAPI = useAuthAPI()

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
   * Handle unauthorized requests without double-refreshing.
   * Global $fetch may already have rotated cookies (and rethrown for
   * non-idempotent methods) — retry once first, then refresh + retry.
   */
  const handleUnauthorizedRequest = async (
    endpoint: string,
    options: RequestOptions,
  ): Promise<any> => {
    console.log('🔄 Auth error — retrying once (cookies may already be fresh)...')

    try {
      return await httpClient.fetch(endpoint, options)
    } catch (retryError) {
      if (!isAuthenticationError(retryError)) {
        throw retryError
      }
    }

    console.log('🔄 Retry still unauthorized — running single-flight refresh...')

    let refreshSuccess = false
    try {
      refreshSuccess = await runSingleFlightRefresh(attemptTokenRefresh)
    } catch (error) {
      console.log('❌ Token refresh error:', error)
      refreshSuccess = false
    }

    if (!refreshSuccess) {
      console.log('❌ Token refresh failed, clearing auth...')
      return await handleAuthFailure()
    }

    console.log('✅ Token refresh successful, retrying original request...')
    try {
      return await httpClient.fetch(endpoint, options)
    } catch {
      return await handleAuthFailure()
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
  const get = async (
    endpoint: string,
    options: Omit<RequestOptions, 'method'> = {},
  ) => {
    return makeAuthenticatedRequest(endpoint, { ...options, method: 'GET' })
  }

  /**
   * Authenticated POST request
   */
  const post = async (
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
  const put = async (
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
  const del = async (
    endpoint: string,
    options: Omit<RequestOptions, 'method'> = {},
  ) => {
    return makeAuthenticatedRequest(endpoint, { ...options, method: 'DELETE' })
  }

  /**
   * Authenticated PATCH request
   */
  const patch = async (
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
   * Get refresh status from the shared global runner
   */
  const getRefreshStatus = () => {
    const state = getGlobalRefreshState()
    return {
      isRefreshing: state.isRefreshing,
      hasRefreshPromise: state.hasRefreshPromise,
      queueLength: state.queueLength,
    }
  }

  /**
   * Get refresh status for external access
   */
  const getGlobalRefreshStatus = () => getRefreshStatus()

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
