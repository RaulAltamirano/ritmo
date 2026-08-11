/**
 * Authenticated HTTP client with cookie auth and single-flight refresh.
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

  const attemptTokenRefresh = async (): Promise<boolean> => {
    try {
      const response = await authAPI.refreshToken()
      if (!response.success) {
        console.warn('Token refresh failed')
      }
      return response.success
    } catch (error) {
      console.warn('Token refresh failed:', error)
      return false
    }
  }

  const makeAuthenticatedRequest = async (
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<any> => {
    const { getCurrentDeviceFingerprint } = await import(
      '../../utils/deviceFingerprint'
    )
    const deviceFingerprint = await getCurrentDeviceFingerprint()

    const authOptions: RequestOptions = {
      ...options,
      credentials: 'include' as RequestCredentials,
      headers: {
        ...options.headers,
        'X-Device-Id': deviceFingerprint.deviceId,
        'X-Device-Type': deviceFingerprint.deviceType,
        'X-Device-Browser': deviceFingerprint.browser,
        'X-Device-OS': deviceFingerprint.os,
      },
    }

    try {
      return await httpClient.fetch(endpoint, authOptions)
    } catch (error: any) {
      if (isAuthenticationError(error)) {
        return handleUnauthorizedRequest(endpoint, authOptions)
      }
      throw error
    }
  }

  /**
   * Global $fetch may already have rotated cookies — retry once first,
   * then refresh + retry only if still unauthorized.
   */
  const handleUnauthorizedRequest = async (
    endpoint: string,
    options: RequestOptions,
  ): Promise<any> => {
    try {
      return await httpClient.fetch(endpoint, options)
    } catch (retryError) {
      if (!isAuthenticationError(retryError)) {
        throw retryError
      }
    }

    let refreshSuccess = false
    try {
      refreshSuccess = await runSingleFlightRefresh(attemptTokenRefresh)
    } catch {
      refreshSuccess = false
    }

    if (!refreshSuccess) {
      return await handleAuthFailure()
    }

    try {
      return await httpClient.fetch(endpoint, options)
    } catch (retryError) {
      if (isAuthenticationError(retryError)) {
        return await handleAuthFailure()
      }
      throw retryError
    }
  }

  const handleAuthFailure = async (): Promise<never> => {
    const { useAuthStore } = await import('@/stores/auth')
    useAuthStore().clearAuth()

    if (process.client) {
      await navigateTo('/auth/login?reason=authentication_required')
    }

    return Promise.reject(new Error('Authentication required'))
  }

  const get = async (
    endpoint: string,
    options: Omit<RequestOptions, 'method'> = {},
  ) => {
    return makeAuthenticatedRequest(endpoint, { ...options, method: 'GET' })
  }

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

  const del = async (
    endpoint: string,
    options: Omit<RequestOptions, 'method'> = {},
  ) => {
    return makeAuthenticatedRequest(endpoint, { ...options, method: 'DELETE' })
  }

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

  const getRefreshStatus = () => {
    const state = getGlobalRefreshState()
    return {
      isRefreshing: state.isRefreshing,
      hasRefreshPromise: state.hasRefreshPromise,
      queueLength: state.queueLength,
    }
  }

  const getGlobalRefreshStatus = () => getRefreshStatus()

  return {
    get,
    post,
    put,
    del,
    patch,
    makeAuthenticatedRequest,
    getRefreshStatus,
    getGlobalRefreshStatus,
    attemptTokenRefresh,
  }
}
