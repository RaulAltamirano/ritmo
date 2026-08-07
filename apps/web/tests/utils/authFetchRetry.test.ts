import { canRetryAfterRefresh, shouldAttemptAuthRefresh } from '@/utils/authFetchRetry'
import { describe, expect, it } from 'vitest'

describe('shouldAttemptAuthRefresh', () => {
  it.each([
    '/auth/refresh',
    '/auth/login',
    '/auth/register',
    '/auth/password-reset',
    '/auth/password-reset-request',
    '/auth/forgot-password',
    '/auth/verify-email',
    '/auth/resend-verification',
    '/auth/device-challenge',
  ])('skips the %s endpoint', path => {
    expect(
      shouldAttemptAuthRefresh(`http://localhost:3001/api${path}`, {
        status: 401,
      }),
    ).toBe(false)
  })

  it('matches public auth endpoint substrings case-insensitively', () => {
    expect(
      shouldAttemptAuthRefresh('/API/AUTH/VERIFY-EMAIL/token', { status: 401 }),
    ).toBe(false)
  })

  it('attempts refresh for authentication errors on protected endpoints', () => {
    expect(shouldAttemptAuthRefresh('/api/work-sessions', { status: 401 })).toBe(true)
  })

  it('does not refresh for non-authentication errors', () => {
    expect(shouldAttemptAuthRefresh('/api/work-sessions', { status: 500 })).toBe(false)
  })
})

describe('canRetryAfterRefresh', () => {
  it.each(['GET', 'get', 'HEAD'])('allows the safe %s method', method => {
    expect(canRetryAfterRefresh(method, undefined)).toBe(true)
  })

  it('allows POST with an Idempotency-Key header', () => {
    expect(canRetryAfterRefresh('POST', { 'Idempotency-Key': 'request-id' })).toBe(true)
  })

  it('finds Idempotency-Key case-insensitively in Headers', () => {
    expect(
      canRetryAfterRefresh('PATCH', new Headers({ 'idempotency-key': 'request-id' })),
    ).toBe(true)
  })

  it('disallows POST without idempotency', () => {
    expect(canRetryAfterRefresh('POST', {})).toBe(false)
  })
})
