import { isAuthenticationError } from '@/utils/authError'

const AUTH_REFRESH_EXCLUSIONS = ['/auth/refresh', '/auth/login', '/auth/register']

function requestPath(requestUrl: string): string {
  try {
    return new URL(requestUrl, 'http://localhost').pathname.replace(/\/$/, '')
  } catch {
    return requestUrl.split(/[?#]/, 1)[0]?.replace(/\/$/, '') ?? requestUrl
  }
}

export function shouldAttemptAuthRefresh(requestUrl: string, error: unknown): boolean {
  if (!isAuthenticationError(error)) return false

  const path = requestPath(requestUrl)
  return !AUTH_REFRESH_EXCLUSIONS.some(endpoint => path.endsWith(endpoint))
}

export function canRetryAfterRefresh(
  method: string,
  headers: HeadersInit | undefined,
): boolean {
  const normalizedMethod = method.toUpperCase()
  if (normalizedMethod === 'GET' || normalizedMethod === 'HEAD') return true
  return new Headers(headers).has('Idempotency-Key')
}
