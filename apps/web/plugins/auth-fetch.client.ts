import { runSingleFlightRefresh } from '@/composables/auth/useGlobalRefreshState'
import { API_ENDPOINTS } from '@/constants/api'
import {
  createAuthAwareFetch,
  SKIP_AUTH_REFRESH_HEADER,
  type AuthFetchOptions,
  type AuthFetchRequest,
} from '@/utils/authAwareFetch'
import { ofetch } from 'ofetch'

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

  const authAwareFetch = createAuthAwareFetch({
    baseFetch: <T = unknown>(request: AuthFetchRequest, options?: AuthFetchOptions) =>
      base(request as Parameters<typeof base>[0], options as never) as Promise<T>,
    runRefresh: refreshAuthentication,
    onAuthFailure: async () => {
      const { useAuthStore } = await import('@/stores/auth')
      useAuthStore().clearAuth()
      await navigateTo(LOGIN_REQUIRED_PATH)
    },
    apiBase: config.public.apiBaseUrl,
  })

  globalThis.$fetch = authAwareFetch as typeof $fetch
})
