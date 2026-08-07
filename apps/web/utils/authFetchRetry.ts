import { isAuthenticationError } from '@/utils/authError'

const AUTH_REFRESH_EXCLUSIONS = [
  '/auth/refresh',
  '/auth/login',
  '/auth/register',
  '/auth/password-reset-request',
  '/auth/password-reset',
  '/auth/forgot-password',
  '/auth/verify-email',
  '/auth/resend-verification',
  '/auth/device-challenge',
]

function requestPath(requestUrl: string): string {
  try {
    return new URL(requestUrl, 'http://localhost').pathname.replace(/\/$/, '')
  } catch {
    return requestUrl.split(/[?#]/, 1)[0]?.replace(/\/$/, '') ?? requestUrl
  }
}

/** Match exclusion as a path suffix or nested segment (not a loose substring). */
function pathMatchesExclusion(path: string, endpoint: string): boolean {
  const normalizedPath = path.toLowerCase()
  const normalizedEndpoint = endpoint.toLowerCase()
  return (
    normalizedPath === normalizedEndpoint ||
    normalizedPath.endsWith(normalizedEndpoint) ||
    normalizedPath.includes(`${normalizedEndpoint}/`)
  )
}

export function shouldAttemptAuthRefresh(requestUrl: string, error: unknown): boolean {
  if (!isAuthenticationError(error)) return false

  const path = requestPath(requestUrl)
  return !AUTH_REFRESH_EXCLUSIONS.some(endpoint => pathMatchesExclusion(path, endpoint))
}

export function canRetryAfterRefresh(
  method: string,
  headers: HeadersInit | undefined,
): boolean {
  const normalizedMethod = method.toUpperCase()
  if (normalizedMethod === 'GET' || normalizedMethod === 'HEAD') return true
  return new Headers(headers).has('Idempotency-Key')
}
