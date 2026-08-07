import { canRetryAfterRefresh, shouldAttemptAuthRefresh } from '@/utils/authFetchRetry'

export const SKIP_AUTH_REFRESH_HEADER = 'X-Ritmo-Skip-Auth-Refresh'

export type AuthFetchRequest = string | URL | Request

export interface AuthFetchOptions {
  method?: string
  headers?: HeadersInit
  [key: string]: unknown
}

interface AuthAwareFetchDependencies {
  baseFetch: <T = unknown>(
    request: AuthFetchRequest,
    options?: AuthFetchOptions,
  ) => Promise<T>
  runRefresh: () => Promise<boolean>
  onAuthFailure: () => void | Promise<void>
  apiBase?: string
}

function isRequest(request: AuthFetchRequest): request is Request {
  return typeof Request !== 'undefined' && request instanceof Request
}

function mergedHeaders(request: AuthFetchRequest, options: AuthFetchOptions): Headers {
  const headers = new Headers(isRequest(request) ? request.headers : undefined)
  new Headers(options.headers).forEach((value, key) => headers.set(key, value))
  return headers
}

export function createAuthAwareFetch({
  baseFetch,
  runRefresh,
  onAuthFailure,
  apiBase,
}: AuthAwareFetchDependencies) {
  return async function authAwareFetch<T = unknown>(
    request: AuthFetchRequest,
    options: AuthFetchOptions = {},
  ): Promise<T> {
    const requestForRetry = isRequest(request) ? request.clone() : request

    try {
      return await baseFetch(request, options)
    } catch (error) {
      const headers = mergedHeaders(request, options)
      const requestUrl = isRequest(request) ? request.url : String(request)
      const resolvedUrl = apiBase ? new URL(requestUrl, apiBase).toString() : requestUrl

      if (headers.get(SKIP_AUTH_REFRESH_HEADER) === '1') throw error
      if (!shouldAttemptAuthRefresh(resolvedUrl, error)) throw error

      const refreshed = await runRefresh()
      if (!refreshed) {
        await onAuthFailure()
        throw error
      }

      const method = String(
        options.method ?? (isRequest(request) ? request.method : 'GET'),
      )
      if (!canRetryAfterRefresh(method, headers)) throw error

      headers.set(SKIP_AUTH_REFRESH_HEADER, '1')
      return await baseFetch(requestForRetry, { ...options, headers })
    }
  }
}
