import { AUTH_TTL } from '@ritmo/config'
import type { CookieOptions, Response } from 'express'

const base = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
})

export function getAccessTokenCookieOptions(): CookieOptions {
  return { ...base(), maxAge: AUTH_TTL.accessTokenMs }
}

export function getRefreshTokenCookieOptions(): CookieOptions {
  return { ...base(), maxAge: AUTH_TTL.refreshTokenMs }
}

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
): void {
  res.cookie('access_token', tokens.accessToken, getAccessTokenCookieOptions())
  res.cookie('refresh_token', tokens.refreshToken, getRefreshTokenCookieOptions())
}

export function clearAuthCookies(res: Response): void {
  const options = base()
  res.clearCookie('access_token', options)
  res.clearCookie('refresh_token', options)
}
