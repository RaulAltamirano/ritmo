import { canRetryAfterRefresh, shouldAttemptAuthRefresh } from '@/utils/authFetchRetry'

/** @deprecated Prefer `skipAuthRefresh` option — never send this header to the API (CORS). */
export const SKIP_AUTH_REFRESH_HEADER = 'X-Ritmo-Skip-Auth-Refresh'

export type AuthFetchRequest = string | URL | Request

export interface AuthFetchOptions {
  method?: string
  headers?: HeadersInit
  body?: unknown
  /** Client-only flag: do not attempt auth refresh/retry for this call. Not sent over the wire. */
  skipAuthRefresh?: boolean
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

function requestUrl(request: AuthFetchRequest): string {
  if (typeof request === 'string') return request
  if (request instanceof URL) return request.href
  return request.url
}

/** Nuxt/devtools/asset requests must not go through the API ofetch baseURL. */
export function isApiBoundRequest(request: AuthFetchRequest, apiBase: string): boolean {
  const raw = requestUrl(request)

  if (/^https?:\/\//i.test(raw)) {
    try {
      return new URL(raw).origin === new URL(apiBase).origin
    } catch {
      return raw.startsWith(apiBase)
    }
  }

  const path = raw.split(/[?#]/, 1)[0] ?? raw
  if (
    path.startsWith('/_nuxt') ||
    path.startsWith('_nuxt') ||
    path.startsWith('/__nuxt') ||
    path.startsWith('__nuxt') ||
    path.includes('/_nuxt/') ||
    path.includes('/builds/meta/')
  ) {
    return false
  }

  return true
}

function mergedHeaders(request: AuthFetchRequest, options: AuthFetchOptions): Headers {
  const headers = new Headers(isRequest(request) ? request.headers : undefined)
  new Headers(options.headers).forEach((value, key) => headers.set(key, value))
  return headers
}

function snapshotBody(body: unknown): { initial: unknown; retry: unknown } {
  if (
    typeof ReadableStream !== 'undefined' &&
    body instanceof ReadableStream
  ) {
    const [initial, retry] = body.tee()
    return { initial, retry }
  }
  return { initial: body, retry: body }
}

/** Strip client-only flags/headers before handing off to ofetch/network. */
export function toNetworkFetchOptions(options: AuthFetchOptions = {}): AuthFetchOptions {
  const { skipAuthRefresh: _skip, ...rest } = options
  if (!rest.headers) return rest

  const headers = new Headers(rest.headers)
  headers.delete(SKIP_AUTH_REFRESH_HEADER)
  return { ...rest, headers }
}

function shouldSkipAuthRefresh(
  request: AuthFetchRequest,
  options: AuthFetchOptions,
): boolean {
  if (options.skipAuthRefresh === true) return true
  return mergedHeaders(request, options).get(SKIP_AUTH_REFRESH_HEADER) === '1'
}

export function createAuthAwareFetch({
  baseFetch,
  runRefresh,
  onAuthFailure,
  apiBase,
}: AuthAwareFetchDependencies) {
  const networkFetch = <T = unknown>(
    request: AuthFetchRequest,
    options?: AuthFetchOptions,
  ) => baseFetch<T>(request, toNetworkFetchOptions(options ?? {}))

  return async function authAwareFetch<T = unknown>(
    request: AuthFetchRequest,
    options: AuthFetchOptions = {},
  ): Promise<T> {
    const requestForRetry = isRequest(request) ? request.clone() : request
    const bodySnapshot =
      options.body !== undefined ? snapshotBody(options.body) : null
    const initialOptions =
      bodySnapshot !== null ? { ...options, body: bodySnapshot.initial } : options

    try {
      return await networkFetch(request, initialOptions)
    } catch (error) {
      const headers = mergedHeaders(request, options)
      const requestUrl = isRequest(request) ? request.url : String(request)
      const resolvedUrl = apiBase ? new URL(requestUrl, apiBase).toString() : requestUrl

      if (shouldSkipAuthRefresh(request, options)) throw error
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

      const retryOptions: AuthFetchOptions = {
        ...options,
        headers,
        skipAuthRefresh: true,
      }
      if (bodySnapshot !== null) retryOptions.body = bodySnapshot.retry
      return await networkFetch(requestForRetry, retryOptions)
    }
  }
}
