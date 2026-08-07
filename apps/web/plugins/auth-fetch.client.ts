import { runSingleFlightRefresh } from '@/composables/auth/useGlobalRefreshState'
import { API_ENDPOINTS } from '@/constants/api'
import { canRetryAfterRefresh, shouldAttemptAuthRefresh } from '@/utils/authFetchRetry'
import { ofetch } from 'ofetch'

const SKIP_AUTH_REFRESH_HEADER = 'X-Ritmo-Skip-Auth-Refresh'
const LOGIN_REQUIRED_PATH = '/auth/login?reason=authentication_required'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const base = ofetch.create({
    baseURL: config.public.apiBaseUrl,
    credentials: 'include',
  })

  async function refreshAuthentication(): Promise<boolean> {
    return runSingleFlightRefresh(async () => {
      try {
        await base(API_ENDPOINTS.AUTH.REFRESH, {
          method: 'POST',
          headers: { [SKIP_AUTH_REFRESH_HEADER]: '1' },
        })
        return true
      } catch {
        return false
      }
    })
  }

  async function authAwareFetch(
    request: Parameters<typeof base>[0],
    options: Parameters<typeof base>[1] = {},
  ) {
    try {
      return await base(request, options)
    } catch (error) {
      const headers = new Headers(options.headers)
      const requestUrl = request instanceof Request ? request.url : String(request)

      if (headers.get(SKIP_AUTH_REFRESH_HEADER) === '1') throw error
      if (!shouldAttemptAuthRefresh(requestUrl, error)) throw error

      const refreshed = await refreshAuthentication()
      if (!refreshed) {
        const { useAuthStore } = await import('@/stores/auth')
        useAuthStore().clearAuth()
        await navigateTo(LOGIN_REQUIRED_PATH)
        throw error
      }

      const method = String(
        options.method ?? (request instanceof Request ? request.method : 'GET'),
      )
      if (!canRetryAfterRefresh(method, options.headers)) throw error

      const retryHeaders = new Headers(options.headers)
      retryHeaders.set(SKIP_AUTH_REFRESH_HEADER, '1')
      return await base(request, { ...options, headers: retryHeaders })
    }
  }

  globalThis.$fetch = authAwareFetch as typeof $fetch
})
