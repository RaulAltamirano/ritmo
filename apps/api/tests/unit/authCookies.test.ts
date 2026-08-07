import { describe, expect, it } from 'vitest'
import { AUTH_TTL } from '@ritmo/config'
import {
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
})
