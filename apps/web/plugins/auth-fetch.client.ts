import { runSingleFlightRefresh } from '@/composables/auth/useGlobalRefreshState'
import { API_ENDPOINTS } from '@/constants/api'
import {
  createAuthAwareFetch,
  isApiBoundRequest,
  toNetworkFetchOptions,
  type AuthFetchOptions,
  type AuthFetchRequest,
} from '@/utils/authAwareFetch'
import { ofetch } from 'ofetch'

const LOGIN_REQUIRED_PATH = '/auth/login?reason=authentication_required'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const apiBase = String(config.public.apiBaseUrl ?? '')
  const originalFetch = globalThis.$fetch
  const apiFetch = ofetch.create({
    baseURL: apiBase,
    credentials: 'include',
  })

  async function refreshAuthentication(): Promise<boolean> {
    return runSingleFlightRefresh(async () => {
      try {
        // Raw API client — no skip header (CORS) and no authAware recursion.
        await apiFetch(API_ENDPOINTS.AUTH.REFRESH, { method: 'POST' })
        return true
      } catch {
        return false
      }
    })
  }

  const authAwareFetch = createAuthAwareFetch({
    baseFetch: <T = unknown>(request: AuthFetchRequest, options?: AuthFetchOptions) => {
      const networkOptions = toNetworkFetchOptions(options ?? {})
      if (!isApiBoundRequest(request, apiBase)) {
        return originalFetch(
          request as Parameters<typeof originalFetch>[0],
          networkOptions as never,
        ) as Promise<T>
      }
      return apiFetch(
        request as Parameters<typeof apiFetch>[0],
        networkOptions as never,
      ) as Promise<T>
    },
    runRefresh: refreshAuthentication,
    onAuthFailure: async () => {
      const { useAuthStore } = await import('@/stores/auth')
      useAuthStore().clearAuth()
      await navigateTo(LOGIN_REQUIRED_PATH)
    },
    apiBase,
  })

  globalThis.$fetch = authAwareFetch as typeof $fetch
})
