import { describe, expect, it } from 'vitest'
import { AUTH_TTL, parseDurationToMs } from '@ritmo/config'

describe('AUTH_TTL', () => {
  it('exposes 15m access and 7d refresh/session', () => {
    expect(AUTH_TTL.accessTokenExpiry).toBe('15m')
    expect(AUTH_TTL.refreshTokenExpiry).toBe('7d')
    expect(AUTH_TTL.accessTokenMs).toBe(15 * 60 * 1000)
    expect(AUTH_TTL.refreshTokenMs).toBe(7 * 24 * 60 * 60 * 1000)
    expect(AUTH_TTL.sessionMs).toBe(AUTH_TTL.refreshTokenMs)
  })

  it('parseDurationToMs parses m/h/d', () => {
    expect(parseDurationToMs('15m')).toBe(15 * 60 * 1000)
    expect(parseDurationToMs('24h')).toBe(24 * 60 * 60 * 1000)
    expect(parseDurationToMs('7d')).toBe(7 * 24 * 60 * 60 * 1000)
  })
})
