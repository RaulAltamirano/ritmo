import { createAuthAwareFetch } from '@/utils/authAwareFetch'
import { describe, expect, it, vi } from 'vitest'

const authenticationError = { status: 401 }

describe('createAuthAwareFetch', () => {
  it('does not refresh excluded public auth URLs', async () => {
    const baseFetch = vi.fn().mockRejectedValue(authenticationError)
    const runRefresh = vi.fn()
    const authFetch = createAuthAwareFetch({
      baseFetch,
      runRefresh,
      onAuthFailure: vi.fn(),
    })

    await expect(authFetch('/api/auth/verify-email/token')).rejects.toBe(
      authenticationError,
    )
    expect(runRefresh).not.toHaveBeenCalled()
  })

  it('returns the successful retry value after refresh', async () => {
    const baseFetch = vi
      .fn()
      .mockRejectedValueOnce(authenticationError)
      .mockResolvedValueOnce({ ok: true })
    const authFetch = createAuthAwareFetch({
      baseFetch,
      runRefresh: vi.fn().mockResolvedValue(true),
      onAuthFailure: vi.fn(),
    })

    await expect(authFetch('/api/users/me')).resolves.toEqual({ ok: true })
    expect(baseFetch).toHaveBeenCalledTimes(2)
  })

  it('refreshes but does not retry a non-idempotent POST body', async () => {
    const baseFetch = vi.fn().mockRejectedValue(authenticationError)
    const runRefresh = vi.fn().mockResolvedValue(true)
    const authFetch = createAuthAwareFetch({
      baseFetch,
      runRefresh,
      onAuthFailure: vi.fn(),
    })

    await expect(
      authFetch('/api/tasks', { method: 'POST', body: { title: 'Task' } }),
    ).rejects.toBe(authenticationError)
    expect(runRefresh).toHaveBeenCalledOnce()
    expect(baseFetch).toHaveBeenCalledOnce()
  })

  it('calls onAuthFailure after a definitive refresh failure', async () => {
    const onAuthFailure = vi.fn()
    const authFetch = createAuthAwareFetch({
      baseFetch: vi.fn().mockRejectedValue(authenticationError),
      runRefresh: vi.fn().mockResolvedValue(false),
      onAuthFailure,
    })

    await expect(authFetch('/api/users/me')).rejects.toBe(authenticationError)
    expect(onAuthFailure).toHaveBeenCalledOnce()
  })

  it('honors the skip header supplied by a Request', async () => {
    const runRefresh = vi.fn()
    const authFetch = createAuthAwareFetch({
      baseFetch: vi.fn().mockRejectedValue(authenticationError),
      runRefresh,
      onAuthFailure: vi.fn(),
    })
    const request = new Request('http://localhost/api/users/me', {
      headers: { 'X-Ritmo-Skip-Auth-Refresh': '1' },
    })

    await expect(authFetch(request)).rejects.toBe(authenticationError)
    expect(runRefresh).not.toHaveBeenCalled()
  })

  it('merges Request and option headers into retry options', async () => {
    const baseFetch = vi
      .fn()
      .mockRejectedValueOnce(authenticationError)
      .mockResolvedValueOnce('retried')
    const authFetch = createAuthAwareFetch({
      baseFetch,
      runRefresh: vi.fn().mockResolvedValue(true),
      onAuthFailure: vi.fn(),
    })
    const request = new Request('http://localhost/api/tasks', {
      method: 'POST',
      headers: { 'Idempotency-Key': 'request-id', 'X-Request': 'request' },
    })

    await authFetch(request, { headers: { 'X-Option': 'option' } })

    const retryOptions = baseFetch.mock.calls[1]?.[1]
    const retryHeaders = new Headers(retryOptions?.headers)
    expect(retryHeaders.get('Idempotency-Key')).toBe('request-id')
    expect(retryHeaders.get('X-Request')).toBe('request')
    expect(retryHeaders.get('X-Option')).toBe('option')
    expect(retryHeaders.get('X-Ritmo-Skip-Auth-Refresh')).toBe('1')
  })
})
