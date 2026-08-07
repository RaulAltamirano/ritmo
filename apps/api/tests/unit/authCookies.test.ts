import { describe, expect, it } from 'vitest'
import { AUTH_TTL } from '@ritmo/config'
import {
  clearAuthCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from '../../src/core/utils/authCookies.js'

describe('authCookies', () => {
  it('aligns maxAge with AUTH_TTL', () => {
    expect(getAccessTokenCookieOptions().maxAge).toBe(AUTH_TTL.accessTokenMs)
    expect(getRefreshTokenCookieOptions().maxAge).toBe(AUTH_TTL.refreshTokenMs)
    expect(getAccessTokenCookieOptions().httpOnly).toBe(true)
    expect(getRefreshTokenCookieOptions().sameSite).toBe('strict')
  })

  it('clears cookies with the same path/sameSite/secure as set', () => {
    const cleared: Array<{ name: string; options: Record<string, unknown> }> = []
    const res = {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        cleared.push({ name, options })
      },
    }

    clearAuthCookies(res as never)

    expect(cleared.map(entry => entry.name)).toEqual([
      'access_token',
      'refresh_token',
    ])
    for (const entry of cleared) {
      expect(entry.options).toMatchObject({
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
      })
      expect(typeof entry.options.secure).toBe('boolean')
    }
  })
})
